import {
  createLinodeInterface,
  deleteLinodeInterface,
  getInterfaces,
  getLinodeInterfaceFirewalls,
  updateLinodeInterface,
  updateLinodeInterfaceSettings,
  upgradeToLinodeInterfaces,
} from 'src/mocks/presets/crud/handlers/linodes/interfaces';
import {
  createLinode,
  deleteLinode,
  getLinodeBackups,
  getLinodeDisks,
  getLinodeFirewalls,
  getLinodeIps,
  getLinodes,
  getLinodeStats,
  getLinodeTransfer,
  shutDownLinode,
  updateLinode,
} from 'src/mocks/presets/crud/handlers/linodes/linodes';

import type { MockPresetCrud } from 'src/mocks/types';

export const linodeCrudPreset: MockPresetCrud = {
  group: { id: 'Linodes' },
  handlers: [
    getLinodes,
    createLinode,
    updateLinode,
    deleteLinode,
    getInterfaces,
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
