import {
  createDestinations,
  createStreams,
  deleteDestination,
  deleteStream,
  getDestinations,
  getStreams,
  updateDestination,
  updateStream,
  verifyDestination,
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
    deleteDestination,
    updateDestination,
    verifyDestination,
  ],
  id: 'datastream:crud',
  label: 'Data Stream CRUD',
};
