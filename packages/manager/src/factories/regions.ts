import * as Factory from 'factory.ts';
import { DNSResolvers, Region } from '@linode/api-v4/lib/regions/types';

export const resolverFactory = Factory.Sync.makeFactory<DNSResolvers>({
  ipv4: '1.1.1.1',
  ipv6: '2600:3c03::',
});

export const regionFactory = Factory.Sync.makeFactory<Region>({
  id: 'us-east',
  label: 'Atlanta, GA',
  status: 'ok',
  country: 'US',
  capabilities: ['Block Storage'],
  resolvers: resolverFactory.build(),
});
