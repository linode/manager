import { Factory } from './factoryProxy';
import { generateLinodeStatSeries } from './linodes';

import type {
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
  NodeBalancerStats,
  NodeBalancerVpcConfig,
} from '@linode/api-v4';

export const nodeBalancerFactory = Factory.Sync.makeFactory<NodeBalancer>({
  client_conn_throttle: 0,
  created: '2019-12-12T00:00:00',
  frontend_address_type: Factory.each((i) => {
    if (i % 2 === 0) {
      return 'vpc';
    } else {
      return 'public';
    }
  }),
  frontend_vpc_subnet_id: null,
  hostname: 'example.com',
  id: Factory.each((id) => id),
  ipv4: '0.0.0.0',
  ipv6: '2600:3c11:e954:1::1',
  label: Factory.each((i) => `nodebalancer-id-${i}`),
  region: 'us-east',
  tags: [],
  transfer: {
    in: 0,
    out: 0,
    total: 0,
  },
  updated: '2019-12-13T00:00:00',
  lke_cluster: Factory.each((i) => {
    if (i % 2 === 0) {
      return {
        id: 1,
        type: 'lkecluster',
        label: 'cluster-1',
        url: '/v4/lke/clusters/1',
      };
    } else {
      return null;
    }
  }),
  type: Factory.each((i) => {
    if (i === 1) {
      return 'premium_40GB';
    }
    if (i % 2 === 0) {
      return 'premium';
    } else {
      return 'common';
    }
  }),
});

export const nodeBalancerConfigFactory =
  Factory.Sync.makeFactory<NodeBalancerConfig>({
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
  });

export const nodeBalancerConfigNodeFactory =
  Factory.Sync.makeFactory<NodeBalancerConfigNode>({
    address: '192.168.0.1:80',
    config_id: Factory.each((id) => id),
    id: Factory.each((id) => id),
    label: 'test',
    mode: 'accept',
    nodebalancer_id: Factory.each((id) => id),
    status: 'DOWN',
    weight: 100,
    vpc_config_id: null,
  });

export const nodeBalancerVPCFactory =
  Factory.Sync.makeFactory<NodeBalancerVpcConfig>({
    id: Factory.each((i) => i),
    ipv4_range: Factory.each((i) => `192.168.${i}.0/30`),
    ipv6_range: null,
    nodebalancer_id: Factory.each((i) => i),
    subnet_id: Factory.each((i) => i),
    vpc_id: Factory.each((i) => i),
    purpose: 'backend',
  });

export const nodeBalancerStatsFactory =
  Factory.Sync.makeFactory<NodeBalancerStats>({
    data: {
      connections: generateLinodeStatSeries(),
      traffic: {
        out: generateLinodeStatSeries(),
        in: generateLinodeStatSeries(),
      },
    },
    title: 'Some fake stats',
  });
