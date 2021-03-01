import * as Factory from 'factory.ts';
import { IPAddress } from '@linode/api-v4/lib/networking';

export const ipAddressFactory = Factory.Sync.makeFactory<IPAddress>({
  address: Factory.each((id) => `192.168.1.${id}`),
  gateway: Factory.each((id) => `192.168.1.${id + 1}`),
  subnet_mask: Factory.each((id) => `192.168.1.${id + 3}`),
  prefix: 24,
  type: 'ipv4',
  public: true,
  rdns: null,
  linode_id: Factory.each((id) => id),
  region: 'us-east',
});
