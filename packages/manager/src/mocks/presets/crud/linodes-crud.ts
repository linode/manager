import {
  createLinode,
  deleteLinode,
  getLinodeBackups,
  getLinodeDisks,
  getLinodeFirewalls,
  getLinodeIps,
  getLinodeStats,
  getLinodeTransfer,
  getLinodes,
  updateLinode,
} from 'src/mocks/handlers/linode-handlers';

import type { MockPresetCrud } from 'src/mocks/types';

export const linodeCrudPreset: MockPresetCrud = {
  group: { id: 'Linodes' },
  handlers: [
    getLinodes,
    createLinode,
    updateLinode,
    deleteLinode,
    getLinodeStats,
    getLinodeDisks,
    getLinodeFirewalls,
    getLinodeTransfer,
    getLinodeIps,
    getLinodeBackups,
  ],
  id: 'linodes:crud',
  label: 'Linode CRUD',
};
