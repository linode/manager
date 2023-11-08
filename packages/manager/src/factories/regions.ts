import {
  RegionAvailability,
  Country,
  DNSResolvers,
  Region,
} from '@linode/api-v4/lib/regions/types';
import * as Factory from 'factory.ts';

import { pickRandom } from 'src/utilities/random';

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
    country: 'id' as Country,
    id: 'id-cgk',
    label: 'Jakarta, ID',
    resolvers: resolverFactory.build(),
    status: 'ok',
  }
);

export const regionAvailabilityFactory = Factory.Sync.makeFactory<RegionAvailability>(
  {
    available: false,
    // TODO SOLD OUT PLANS - Remove this comment once the API is changed: Note that the mock data below doesn't match what the API
    // currently returns for plans; however, the API will be changing soon to match the below labels (ex: g7-premium-#, g1-gpu-rtx-6000-#)
    plan: Factory.each((id) =>
      pickRandom([`g7-premium-${id}`, `g1-gpu-rtx6000-${id}`])
    ),
    region: Factory.each((id) => `us-${id}`),
  }
);
