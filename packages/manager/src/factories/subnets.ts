import { Subnet } from '@linode/api-v4/lib/vpcs/types';
import * as Factory from 'factory.ts';

export const subnetFactory = Factory.Sync.makeFactory<Subnet>({
  created: '2023-07-12T16:08:53',
  id: Factory.each((i) => i),
  ipv4: '0.0.0.0/0',
  label: Factory.each((i) => `subnet-${i}`),
  linodes: Factory.each((i) =>
    Array.from({ length: i }, () => Math.floor(Math.random() * 100))
  ),
  updated: '2023-07-12T16:08:53',
});
