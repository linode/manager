import {
  createDestinations,
  createStreams,
  deleteStream,
  getDestinations,
  getStreams,
  updateStream,
} from 'src/mocks/presets/crud/handlers/datastream';

import type { MockPresetCrud } from 'src/mocks/types';

export const datastreamCrudPreset: MockPresetCrud = {
  group: { id: 'DataStream' },
  handlers: [
    getStreams,
    createStreams,
    deleteStream,
    updateStream,
    getDestinations,
    createDestinations,
  ],
  id: 'datastream:crud',
  label: 'Data Stream CRUD',
};
