import * as Factory from 'factory.ts';
import { DNSResolvers, Region } from '@linode/api-v4/lib/regions/types';
import regionData from 'src/cachedData/regions.json';

export const resolverFactory = Factory.Sync.makeFactory<DNSResolvers>({
  ipv4: '1.1.1.1',
  ipv6: '2600:3c03::',
});

const regions = regionData.data;

export const regionFactory = Factory.Sync.makeFactory<Region>({
  id: Factory.each((id) => regions[id % regions.length].id),
  label: Factory.each((id) => regions[id % regions.length].label),
  status: 'ok',
  country: 'US',
  capabilities: ['Block Storage'],
  resolvers: resolverFactory.build(),
});
