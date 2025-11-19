import { Factory } from '@linode/utilities';

import type {
  NetworkLoadBalancer,
  NetworkLoadBalancerListener,
  NetworkLoadBalancerNode,
} from '@linode/api-v4';

export const networkLoadBalancerFactory =
  Factory.Sync.makeFactory<NetworkLoadBalancer>({
    id: Factory.each((id) => id),
    label: Factory.each((id) => `nlb-${id}`),
    region: 'us-east',
    address_v4: '192.168.1.1',
    address_v6: '2001:db8:85a3::8a2e:370:7334',
    created: '2023-01-01T00:00:00Z',
    updated: '2023-01-02T00:00:00Z',
    status: 'active',
    last_composite_updated: '',
    listeners: [],
  });

export const networkLoadBalancerListenerFactory =
  Factory.Sync.makeFactory<NetworkLoadBalancerListener>({
    created: '2023-01-01T00:00:00Z',
    id: Factory.each((id) => id),
    label: Factory.each((id) => `nlb-listener-${id}`),
    updated: '2023-01-01T00:00:00Z',
    port: 80,
    protocol: 'tcp',
  });

export const networkLoadBalancerNodeFactory =
  Factory.Sync.makeFactory<NetworkLoadBalancerNode>({
    address_v6: '2001:db8:85a3::8a2e:370:7334',
    created: '2023-01-01T00:00:00Z',
    id: Factory.each((id) => id),
    label: Factory.each((id) => `nlb-node-${id}`),
    updated: '2023-01-01T00:00:00Z',
    linode_id: Factory.each((id) => id),
    weight: 0,
    weight_updated: '',
  });
