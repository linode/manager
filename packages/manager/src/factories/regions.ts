import * as Factory from 'factory.ts';

import type {
  Country,
  DNSResolvers,
  Region,
  RegionAvailability,
} from '@linode/api-v4/lib/regions/types';

export const resolverFactory = Factory.Sync.makeFactory<DNSResolvers>({
  ipv4: '1.1.1.1',
  ipv6: '2600:3c03::',
});

export const regionFactory = Factory.Sync.makeFactory<Region>({
  capabilities: ['Block Storage'],
  country: 'us',
  id: Factory.each((id) => `us-${id}`),
  label: Factory.each((id) => `${id}, NJ`),
  maximum_pgs_per_customer: 5,
  maximum_vms_per_pg: 10,
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
      'Placement Group',
      'Vlans',
      'Premium Plans',
    ],
    country: 'id' as Country,
    id: 'id-cgk',
    label: 'Jakarta, ID',
    maximum_pgs_per_customer: 5,
    maximum_vms_per_pg: 10,
    resolvers: resolverFactory.build(),
    status: 'ok',
  }
);

export const regionAvailabilityFactory = Factory.Sync.makeFactory<RegionAvailability>(
  {
    available: false,
    plan: 'g6-standard-7',
    region: 'us-east',
  }
);
