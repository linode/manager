import { DNSResolvers, Region } from '@linode/api-v4/lib/regions/types';
import * as Factory from 'factory.ts';

export const resolverFactory = Factory.Sync.makeFactory<DNSResolvers>({
  ipv4: '1.1.1.1',
  ipv6: '2600:3c03::',
});

export const regionFactory = Factory.Sync.makeFactory<Region>({
  capabilities: ['Block Storage'],
  country: 'US',
  id: Factory.each((id) => `us-${id}`),
  label: Factory.each((id) => `${id}, NJ`),
  resolvers: resolverFactory.build(),
  status: 'ok',
});

export const regionWithDynamicPricingFactory = Factory.Sync.makeFactory<Region>(
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'Premium Plans',
    ],
    country: 'id',
    id: 'id-cgk',
    label: 'Jakarta, ID',
    resolvers: resolverFactory.build(),
    status: 'ok',
  }
);
