import { getLinodes, createLinodes } from 'src/mocks/handlers/linode-handlers';
import { MockPreset } from 'src/mocks/mockPreset';

export const linodeCrudPreset: MockPreset = {
  label: 'Linode CRUD',
  id: 'linodes-crud',
  group: 'Linodes',
  handlers: [getLinodes, createLinodes],
};
