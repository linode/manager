import { Factory } from '@linode/utilities';

import type { IPAddress } from '@linode/api-v4/lib/networking';

export const ipAddressFactory = Factory.Sync.makeFactory<IPAddress>({
  address: Factory.each((id) => `192.168.1.${id}`),
  gateway: Factory.each((id) => `192.168.1.${id + 1}`),
  interface_id: Factory.each((id) => id),
  linode_id: Factory.each((id) => id),
  prefix: 24,
  public: true,
  rdns: null,
  region: 'us-east',
  subnet_mask: Factory.each((id) => `192.168.1.${id + 3}`),
  type: 'ipv4',
});
