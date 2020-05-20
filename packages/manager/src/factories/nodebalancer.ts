import * as Factory from 'factory.ts';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers/types';

export const nodeBalancerFactory = Factory.Sync.makeFactory<NodeBalancer>({
  id: Factory.each(id => id),
  label: Factory.each(i => `nodebalancer-id-${i}`),
  hostname: 'example.com',
  client_conn_throttle: 0,
  region: 'us-east',
  ipv4: '0.0.0.0',
  ipv6: null,
  created: '2019-12-12T00:00:00',
  updated: '2019-12-13T00:00:00',
  transfer: {
    in: 0,
    out: 0,
    total: 0
  },
  tags: []
});
