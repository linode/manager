import {
  allocateIP,
  getIPAddresses,
  getReservedIPsTypes,
  reserveIP,
} from 'src/mocks/presets/crud/handlers/networking';

import type { MockPresetCrud } from 'src/mocks/types';

export const networkingCrudPreset: MockPresetCrud = {
  group: { id: 'IP Addresses' },
  handlers: [getIPAddresses, allocateIP, getReservedIPsTypes, reserveIP],
  id: 'ip-addresses:crud',
  label: 'IP Addresses CRUD',
};
