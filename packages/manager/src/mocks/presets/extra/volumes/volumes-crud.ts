import {
  createVolumes,
  deleteVolumes,
  updateVolumes,
  getVolumes,
} from 'src/mocks/handlers/volume-handlers';
import { MockPreset } from 'src/mocks/mockPreset';

export const volumeCrudPreset: MockPreset = {
  label: 'Volumes CRUD',
  id: 'volumes-crud',
  group: 'Volumes',
  handlers: [createVolumes, deleteVolumes, updateVolumes, getVolumes],
};
