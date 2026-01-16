import { createLock, deleteLock, getLocks } from './handlers/locks';

import type { MockPresetCrud } from 'src/mocks/types';

export const locksCrudPreset: MockPresetCrud = {
  group: { id: 'Locks' },
  handlers: [getLocks, createLock, deleteLock],
  id: 'locks:crud',
  label: 'Resource Locks CRUD',
};
