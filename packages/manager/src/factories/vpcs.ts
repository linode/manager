import Factory from 'src/factories/factoryProxy';

import type { VPC, VPCIP } from '@linode/api-v4';

export const vpcFactory = Factory.Sync.makeFactory<VPC>({
  created: '2023-07-12T16:08:53',
  description: '',
  id: Factory.each((i) => i),
  label: Factory.each((i) => `vpc-${i}`),
  region: 'us-east',
  subnets: [],
  updated: '2023-07-12T16:08:53',
});

export const vpcIPFactory = Factory.Sync.makeFactory<VPCIP>({
  active: true,
  address: '192.0.2.141',
  address_range: null,
  config_id: Factory.each((i) => i),
  gateway: '192.0.2.1',
  interface_id: Factory.each((i) => i),
  linode_id: Factory.each((i) => i),
  nat_1_1: '192.0.2.97',
  prefix: 24,
  region: 'us-east',
  subnet_id: Factory.each((i) => i),
  subnet_mask: '192.0.2.3',
  vpc_id: Factory.each((i) => i),
});
