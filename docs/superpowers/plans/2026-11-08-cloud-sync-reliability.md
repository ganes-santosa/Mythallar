# Cloud Sync Multi-Device Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate ghost character/spell resurrection across devices by introducing deletion tombstones, authoritative cloud reconciliation, homebrew spell deletion API, and live Supabase Realtime subscriptions.

**Architecture:**
1. `src/utils/storage.js`: Add `loadDeletedIds`, `saveDeletedId(id)`, `clearDeletedId(id)`, `pruneDeletedIds(maxAgeDays)`.
2. `src/utils/syncService.js`:
   - Enhance `mergeLocalAndCloud(localList, cloudList, deletedIds)` to filter out tombstoned items.
   - Add `deleteCloudHomebrew(client, userId, spellId)`.
   - Add `reconcileCloudPull(localList, cloudList, deletedIds, hasSyncedBefore)`: reconciles missing items when authenticated so deleted cloud records are pruned locally.
   - Add `subscribeToUserChanges(client, userId, { onCharacterChange, onCharacterDelete, onHomebrewChange, onHomebrewDelete })`.
3. `src/App.jsx`:
   - Wire `saveDeletedId` when deleting characters and homebrew spells.
   - Wire `deleteCloudHomebrew` on spell deletion.
   - Wire `reconcileCloudPull` on cloud pull.
   - Wire Realtime listener so Device B updates instantly when Device A deletes or edits a character.

**Tech Stack:** React 18, Supabase JS Realtime, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-cloud-sync-reliability-design.md`

## Global Constraints
- Must not break offline guest users without Supabase credentials.
- Zero-outline visual guidelines preserved.
- All existing tests in Vitest suite (311 tests) must remain green.

## Review Focus
- Guest users without authentication: deleting characters locally must continue working without errors.
- Syncing after offline deletion: deleted items must never be pushed back to cloud.
- Re-creating character with same ID or newer update after deletion: should respect timestamp.
- Supabase Realtime unavailable or error: graceful degradation without throwing unhandled exceptions.

---

### Task 1: Deletion Tombstones & Storage Helpers

**Files:**
- Modify: `src/utils/storage.js`
- Test: `src/utils/storage.test.js`

- [ ] **Step 1: Write failing tests in `src/utils/storage.test.js`**
  - Test `saveDeletedId(id, timestamp)` saves to localStorage.
  - Test `loadDeletedIds()` loads map of ID -> timestamp.
  - Test `isDeletedId(id, updated_at)` returns true if updated_at is older than or equal to deletion time.

- [ ] **Step 2: Run test to verify it fails**
  `npm.cmd test -- src/utils/storage.test.js --run`

- [ ] **Step 3: Implement helpers in `src/utils/storage.js`**
  - Implement `DELETED_IDS_STORAGE_KEY = 'mythallar_deleted_ids_v1'`.
  - Implement `loadDeletedIds`, `saveDeletedId`, `removeDeletedId`, `isDeletedId`.

- [ ] **Step 4: Run test to verify it passes**
  `npm.cmd test -- src/utils/storage.test.js --run`

---

### Task 2: SyncService Enhancements (Tombstone Filter, Delete Homebrew, Cloud Reconcile, Realtime)

**Files:**
- Modify: `src/utils/syncService.js`
- Test: `src/utils/syncService.test.js`

- [ ] **Step 1: Write failing tests in `src/utils/syncService.test.js`**
  - Test `mergeLocalAndCloud` ignores cloud items present in `deletedIds`.
  - Test `deleteCloudHomebrew` calls `client.from('homebrew_spells').delete().eq('id', spellId)`.
  - Test `reconcileCloudPull` prunes local items absent from cloud if user was already synced.
  - Test `subscribeToUserChanges` sets up channel with postgres_changes for characters and homebrew_spells.

- [ ] **Step 2: Run test to verify it fails**
  `npm.cmd test -- src/utils/syncService.test.js --run`

- [ ] **Step 3: Implement functions in `src/utils/syncService.js`**
  - Update `mergeLocalAndCloud(localList, cloudList, deletedIds = {})`.
  - Implement `deleteCloudHomebrew(client, userId, spellId)`.
  - Implement `reconcileCloudPull(localList, cloudList, deletedIds = {}, hasSyncedBefore = false)`.
  - Implement `subscribeToUserChanges(client, userId, callbacks)`.

- [ ] **Step 4: Run test to verify it passes**
  `npm.cmd test -- src/utils/syncService.test.js --run`

---

### Task 3: App Integration (Tombstones, Spell Deletes, Realtime Listeners)

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Write integration tests in `src/App.test.jsx`**
  - Test deleting a character records tombstone and calls `deleteCloudCharacter`.
  - Test deleting a homebrew spell calls `deleteCloudHomebrew`.
  - Test initial sync uses `reconcileCloudPull` so deleted characters on remote don't get resurrected.

- [ ] **Step 2: Run test to verify it fails**
  `npm.cmd test -- src/App.test.jsx --run`

- [ ] **Step 3: Wire in `src/App.jsx`**
  - Update `handleDeleteCharacter` to call `saveDeletedId(charId)`.
  - Update `handleDeleteHomebrewSpell` to call `saveDeletedId(spellId)` and `deleteCloudHomebrew(supabase, user.id, spellId)`.
  - Update initial cloud pull to use `reconcileCloudPull(prev.profiles, cloudChars, loadDeletedIds(), true)`.
  - Hook `subscribeToUserChanges` inside a `useEffect` when `supabase` and `user` are present.

- [ ] **Step 4: Run test to verify it passes**
  `npm.cmd test -- src/App.test.jsx --run`

---

### Task 4: Full Suite Verification & Build

- [ ] **Step 1: Run complete test suite**
  `npm.cmd test -- --run`
- [ ] **Step 2: Run production build**
  `npm.cmd run build`
