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
