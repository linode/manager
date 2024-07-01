import { createLinodes, getLinodes } from 'src/mocks/handlers/linode-handlers';

import type { MockPreset } from 'src/mocks/types';

export const linodeCrudPreset: MockPreset = {
  group: 'Linodes',
  handlers: [getLinodes, createLinodes],
  id: 'linodes-crud',
  label: 'Linode CRUD',
};
