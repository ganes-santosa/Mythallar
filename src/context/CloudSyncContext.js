import { createContext } from 'react';

/**
 * Cloud status for the character manager.
 * { signedIn, getStatus(char) -> 'local'|'synced'|'syncing'|'error', onSyncCharacter(id) }
 */
export const CloudSyncContext = createContext({ signedIn: false });
