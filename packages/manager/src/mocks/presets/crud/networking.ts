import {
  allocateIP,
  getIPAddresses,
  getReservedIPs,
  getReservedIPsTypes,
  reserveIP,
} from 'src/mocks/presets/crud/handlers/networking';

import type { MockPresetCrud } from 'src/mocks/types';

export const networkingCrudPreset: MockPresetCrud = {
  group: { id: 'IP Addresses' },
  handlers: [getIPAddresses],
  id: 'ip-addresses:crud',
  label: 'IP Addresses CRUD',
};

export const reservedIPsCrudPreset: MockPresetCrud = {
  group: { id: 'Reserved IPs' },
  handlers: [getReservedIPs, allocateIP, getReservedIPsTypes, reserveIP],
  id: 'reserved-ips:crud',
  label: 'Reserved IPs CRUD',
};
