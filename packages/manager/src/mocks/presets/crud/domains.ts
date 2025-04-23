import {
  cloneDomain,
  createDomain,
  deleteDomains,
  getDomains,
  importDomain,
  updateDomain,
} from 'src/mocks/presets/crud/handlers/domains';

import type { MockPresetCrud } from 'src/mocks/types';

export const domainCrudPreset: MockPresetCrud = {
  group: { id: 'Domains' },
  handlers: [
    createDomain,
    deleteDomains,
    updateDomain,
    getDomains,
    cloneDomain,
    importDomain,
  ],
  id: 'domains:crud',
  label: 'Domains CRUD',
};
