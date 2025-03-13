import { Factory } from '@linode/utilities';

import type {
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
} from '@linode/api-v4/lib/nodebalancers/types';

export const nodeBalancerFactory = Factory.Sync.makeFactory<NodeBalancer>({
  client_conn_throttle: 0,
  created: '2019-12-12T00:00:00',
  hostname: 'example.com',
  id: Factory.each((id) => id),
  ipv4: '0.0.0.0',
  ipv6: null,
  label: Factory.each((i) => `nodebalancer-id-${i}`),
  region: 'us-east',
  tags: [],
  transfer: {
    in: 0,
    out: 0,
    total: 0,
  },
  updated: '2019-12-13T00:00:00',
});

export const nodeBalancerConfigFactory = Factory.Sync.makeFactory<NodeBalancerConfig>(
  {
    algorithm: 'roundrobin',
    check: 'connection',
    check_attempts: 2,
    check_body: '',
    check_interval: 5,
    check_passive: true,
    check_path: '/ping_me',
    check_timeout: 3,
    cipher_suite: 'recommended',
    id: Factory.each((id) => id),
    nodebalancer_id: Factory.each((id) => id),
    nodes: [],
    nodes_status: { down: 1, up: 0 },
    port: 80,
    protocol: 'http',
    proxy_protocol: 'none',
    ssl_cert: '',
    ssl_commonname: '',
    ssl_fingerprint: '',
    ssl_key: '',
    stickiness: 'table',
  }
);

export const nodeBalancerConfigNodeFactory = Factory.Sync.makeFactory<NodeBalancerConfigNode>(
  {
    address: '192.168.0.1:80',
    config_id: Factory.each((id) => id),
    id: Factory.each((id) => id),
    label: 'test',
    mode: 'accept',
    nodebalancer_id: Factory.each((id) => id),
    status: 'DOWN',
    weight: 100,
  }
);
