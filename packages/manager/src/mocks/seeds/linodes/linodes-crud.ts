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

import type { MockPreset } from 'src/mocks/types';

export const linodeCrudPreset: MockPreset = {
  group: 'Linodes',
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
  id: 'linodes-crud',
  label: 'Linode CRUD',
};
