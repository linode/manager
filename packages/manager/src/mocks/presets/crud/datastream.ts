import {
  createStreams,
  getDestinations,
  getStreams,
} from 'src/mocks/presets/crud/handlers/datastream';

import type { MockPresetCrud } from 'src/mocks/types';

export const datastreamCrudPreset: MockPresetCrud = {
  group: { id: 'DataStream' },
  handlers: [getStreams, createStreams, getDestinations],
  id: 'datastream:crud',
  label: 'Data Stream CRUD',
};
