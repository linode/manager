import * as Factory from 'factory.ts';
import { DNSResolvers, Region } from '@linode/api-v4/lib/regions/types';
import { dcDisplayNames } from 'src/constants';

export const resolverFactory = Factory.Sync.makeFactory<DNSResolvers>({
  ipv4: '1.1.1.1',
  ipv6: '2600:3c03::',
});

export const regionFactory = Factory.Sync.makeFactory<Region>({
  id: Factory.each(id => Object.keys(dcDisplayNames)[id + 1] || `region-${id}`),
  status: 'ok',
  country: 'US',
  capabilities: ['Block Storage'],
  resolvers: resolverFactory.build(),
});
