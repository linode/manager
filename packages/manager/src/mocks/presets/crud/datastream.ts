import {
  createStreams,
  getStreams,
} from 'src/mocks/presets/crud/handlers/datastream';

import type { MockPresetCrud } from 'src/mocks/types';

export const datastreamCrudPreset: MockPresetCrud = {
  group: { id: 'DataStream' },
  handlers: [getStreams, createStreams],
  id: 'datastream:crud',
  label: 'Data Stream CRUD',
};
