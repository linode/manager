import {
  assignCloudNATAddress,
  createCloudNAT,
  deleteCloudNAT,
  deleteCloudNATAddress,
  getCloudNATAddress,
  getCloudNATAddresses,
  getCloudNATs,
  updateCloudNAT,
} from 'src/mocks/presets/crud/handlers/cloudnats';

import type { MockPresetCrud } from 'src/mocks/types';

export const cloudNATCrudPreset: MockPresetCrud = {
  group: { id: 'CloudNATs' },
  handlers: [
    createCloudNAT,
    deleteCloudNAT,
    updateCloudNAT,
    getCloudNATs,
    assignCloudNATAddress,
    getCloudNATAddresses,
    getCloudNATAddress,
    deleteCloudNATAddress,
  ],
  id: 'cloudnats:crud',
  label: 'CloudNATs CRUD',
};
