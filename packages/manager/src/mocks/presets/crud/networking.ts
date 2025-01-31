import { getIPAddresses } from 'src/mocks/presets/crud/handlers/networking';

import type { MockPresetCrud } from 'src/mocks/types';

export const networkingCrudPreset: MockPresetCrud = {
  group: { id: 'Networking' },
  handlers: [getIPAddresses],
  id: 'networking:crud',
  label: 'Networking CRUD',
};
