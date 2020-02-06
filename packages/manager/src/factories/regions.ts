import * as Factory from 'factory.ts';
import { Region } from 'linode-js-sdk/lib/regions/types';
import { dcDisplayNames } from 'src/constants';

export const regionFactory = Factory.Sync.makeFactory<Region>({
  id: Factory.each(id => Object.keys(dcDisplayNames)[id + 1] || `region-${id}`),
  status: 'ok',
  country: 'US',
  capabilities: ['Block Storage']
});
