import {
  createVolumes,
  deleteVolumes,
  getVolumes,
  updateVolumes,
} from 'src/mocks/presets/crud/handlers/volumes';

import type { MockPresetCrud } from 'src/mocks/types';

export const volumeCrudPreset: MockPresetCrud = {
  group: { id: 'Volumes' },
  handlers: [createVolumes, deleteVolumes, updateVolumes, getVolumes],
  id: 'volumes:crud',
  label: 'Volumes CRUD',
};
