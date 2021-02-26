import * as Factory from 'factory.ts';
import {
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
} from '@linode/api-v4/lib/nodebalancers/types';

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
    total: 0,
  },
  tags: [],
});

export const nodeBalancerConfigFactory = Factory.Sync.makeFactory<
  NodeBalancerConfig
>({
  id: Factory.each(id => id),
  algorithm: 'roundrobin',
  check: 'connection',
  check_attempts: 2,
  check_body: '',
  check_interval: 5,
  check_passive: true,
  check_path: '/ping_me',
  proxy_protocol: 'none',
  check_timeout: 3,
  cipher_suite: 'recommended',
  nodebalancer_id: Factory.each(id => id),
  nodes_status: { up: 0, down: 1 },
  port: 80,
  protocol: 'http',
  nodes: [],
  ssl_cert: '',
  ssl_commonname: '',
  ssl_fingerprint: '',
  ssl_key: '',
  stickiness: 'table',
});

export const nodeBalancerConfigNodeFactory = Factory.Sync.makeFactory<
  NodeBalancerConfigNode
>({
  id: Factory.each(id => id),
  address: '192.168.0.1:80',
  config_id: Factory.each(id => id),
  label: 'test',
  mode: 'accept',
  nodebalancer_id: Factory.each(id => id),
  status: 'DOWN',
  weight: 100,
});
