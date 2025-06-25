import {
  createCloudNAT,
  deleteCloudNAT,
  getCloudNATs,
  updateCloudNAT,
} from 'src/mocks/presets/crud/handlers/cloudnats';

import type { MockPresetCrud } from 'src/mocks/types';

export const cloudNATCrudPreset: MockPresetCrud = {
  group: { id: 'CloudNATs' },
  handlers: [createCloudNAT, deleteCloudNAT, updateCloudNAT, getCloudNATs],
  id: 'cloudnats:crud',
  label: 'CloudNATs CRUD',
};
