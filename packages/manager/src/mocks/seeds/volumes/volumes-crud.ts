import {
  createVolumes,
  deleteVolumes,
  getVolumes,
  updateVolumes,
} from 'src/mocks/handlers/volume-handlers';

import type { MockPreset } from 'src/mocks/types';

export const volumeCrudPreset: MockPreset = {
  group: 'Volumes',
  handlers: [createVolumes, deleteVolumes, updateVolumes, getVolumes],
  id: 'volumes-crud',
  label: 'Volumes CRUD',
};
