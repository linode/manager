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
  shutDownLinode,
  updateLinode,
} from 'src/mocks/presets/crud/handlers/linodes';

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
    shutDownLinode,
  ],
  id: 'linodes:crud',
  label: 'Linode CRUD',
};
