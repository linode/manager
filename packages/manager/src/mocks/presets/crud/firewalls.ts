import { createFirewall } from 'src/mocks/presets/crud/handlers/firewalls';

import type { MockPresetCrud } from 'src/mocks/types';

export const firewallCrudPreset: MockPresetCrud = {
  group: { id: 'Firewalls' },
  handlers: [createFirewall],
  id: 'firewalls:crud',
  label: 'Firewall CRUD',
};
