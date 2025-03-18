import {
  createLinode,
  createLinodeInterface,
  deleteLinode,
  deleteLinodeInterface,
  getLinodeBackups,
  getLinodeDisks,
  getLinodeFirewalls,
  getLinodeIps,
  getLinodeStats,
  getLinodeTransfer,
  getLinodes,
  shutDownLinode,
  updateLinode,
  upgradeToLinodeInterfaces,
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
    upgradeToLinodeInterfaces,
    deleteLinodeInterface,
    createLinodeInterface,
  ],
  id: 'linodes:crud',
  label: 'Linode CRUD',
};
