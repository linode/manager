import { VPC } from '@linode/api-v4/lib/vpcs/types';
import Factory from 'src/factories/factoryProxy';

export const vpcFactory = Factory.Sync.makeFactory<VPC>({
  created: '2023-07-12T16:08:53',
  description: '',
  id: Factory.each((i) => i),
  label: Factory.each((i) => `vpc-${i}`),
  region: 'us-east',
  subnets: [],
  updated: '2023-07-12T16:08:53',
});
