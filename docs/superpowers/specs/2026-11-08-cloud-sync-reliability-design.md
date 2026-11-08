# Multi-Device Cloud Sync Reliability Design

## Context & Problem
Players report that deleting characters (e.g. keeping only Arthur Blackburne) fails to synchronize across devices:
- Deleting characters on Device A removes them in Supabase, but Device B still has them in `localStorage`.
- When Device B opens, its local copy remains intact, or on refresh, Device B syncs them *back* to Supabase.
- When Device A refreshes, it fetches the resurrected characters from Supabase.
- Furthermore, deleted homebrew spells have no Supabase deletion call at all, causing eternal resurrection.

## Root Cause
1. `mergeLocalAndCloud(localList, cloudList)` performs a union merge. Any item in `cloudList` that is missing locally gets revived. Any item in `localList` that was deleted in the cloud is retained and subsequently pushed back to the cloud by the auto-sync debounced effect.
2. No deletion tracking (tombstones): The app cannot distinguish between "a new item created locally offline" and "an item deleted on another device".
3. Homebrew spells lack `deleteCloudHomebrew` helper, so deleted spells are never removed from Supabase.
4. No Realtime synchronization: Remote deletions/updates on Device A require manual refresh on Device B.

## Architecture & Solution

### 1. Deletion Tombstones in Local Storage & Sync Engine
- Add `deletedIds` store in `storage.js` (`mythallar_deleted_ids_v1`):
  - Maps `id -> timestamp` for characters and homebrew spells deleted on this device.
  - Automatically prune entries older than 30 days to avoid unbounded growth.
- In `mergeLocalAndCloud(localList, cloudList, deletedIds)`:
  - If an item's ID is in `deletedIds`, and its `updated_at` is older than or equal to the deletion timestamp, it is **discarded** (not resurrected).
  - If a cloud item is newer than the deletion timestamp (e.g. edited on another device after deletion), it survives.

### 2. Reconciliation with Cloud Authoritative Deletion
- When authenticated (`user != null`), upon fetching cloud data:
  - If Device A deleted a character in the cloud, and Device B pulls cloud characters:
    - For any local character that is already marked as synced (or if the user has completed at least one cloud sync session): if it is missing from the cloud fetch and was not created offline after the last sync timestamp, Device B removes it locally instead of resurrecting it.
  - Track `lastCloudSyncTimestamp` in `storage.js` / session.
- Add `deleteCloudHomebrew(client, userId, spellId)` and invoke it in `handleDeleteHomebrewSpell`.

### 3. Supabase Realtime Subscription (Cross-Device Live Sync)
- Subscribe to Postgres changes on `characters` and `homebrew_spells` for `user_id = user.id`:
  - `DELETE` event: immediately filter out the deleted character/spell from local React state and `localStorage` without resurrecting it.
  - `INSERT` / `UPDATE` event: merge the updated character/spell into state if newer than local.

### 4. Robust Delete Handlers
- When a user deletes a character or homebrew spell:
  1. Record the ID in `deletedIds` in `localStorage`.
  2. Remove from React state and update `localStorage`.
  3. Await / fire `deleteCloudCharacter(supabase, user.id, charId)` with error retry / logging.
  4. Ensure the debounced push does not re-upload deleted IDs.
