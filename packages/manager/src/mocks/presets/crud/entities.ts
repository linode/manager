import { getEntities } from 'src/mocks/presets/crud/handlers/entities';

import type { MockPresetCrud } from 'src/mocks/types';

export const entityCrudPreset: MockPresetCrud = {
  group: { id: 'Entities' },
  handlers: [getEntities],
  id: 'entities:crud',
  label: 'Entities CRUD',
};
