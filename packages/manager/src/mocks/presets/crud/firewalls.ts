import {
  createFirewall,
  createFirewallDevice,
  deleteFirewall,
  deleteFirewallDevice,
  getFirewalls,
  updateFirewall,
} from 'src/mocks/presets/crud/handlers/firewalls';

import type { MockPresetCrud } from 'src/mocks/types';

export const firewallCrudPreset: MockPresetCrud = {
  group: { id: 'Firewalls' },
  handlers: [
    createFirewall,
    createFirewallDevice,
    deleteFirewall,
    deleteFirewallDevice,
    getFirewalls,
    updateFirewall,
  ],
  id: 'firewalls:crud',
  label: 'Firewall CRUD',
};
