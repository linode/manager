import {
  createLinode,
  createLinodeInterface,
  deleteLinode,
  deleteLinodeInterface,
  getLinodeBackups,
  getLinodeDisks,
  getLinodeFirewalls,
  getLinodeInterfaceFirewalls,
  getLinodeIps,
  getLinodes,
  getLinodeStats,
  getLinodeTransfer,
  shutDownLinode,
  updateLinode,
  updateLinodeInterface,
  updateLinodeInterfaceSettings,
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
    updateLinodeInterface,
    updateLinodeInterfaceSettings,
    getLinodeInterfaceFirewalls,
  ],
  id: 'linodes:crud',
  label: 'Linode CRUD',
};
