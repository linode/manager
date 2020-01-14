import * as Factory from 'factory.ts';
import { Region } from 'linode-js-sdk/lib/regions/types';

export const regionFactory = Factory.Sync.makeFactory<Region>({
  id: Factory.each(id => `us-east-${id}`),
  status: 'ok',
  country: 'US',
  capabilities: ['Block Storage']
});
