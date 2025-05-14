import type { NodeBalancerConfigNode } from '@linode/api-v4/lib/nodebalancers';

export const nodes: NodeBalancerConfigNode[] = [
  {
    address: '192.168.160.160:80',
    config_id: 1,
    id: 571,
    label: 'config 1',
    mode: 'accept',
    nodebalancer_id: 642,
    status: 'UP',
    weight: 100,
  },
  {
    address: '192.168.160.160:80',
    config_id: 1,
    id: 572,
    label: 'config 2',
    mode: 'accept',
    nodebalancer_id: 642,
    status: 'UP',
    weight: 100,
  },
  {
    address: '192.168.160.160:80',
    config_id: 1,
    id: 573,
    label: 'config 3',
    mode: 'accept',
    nodebalancer_id: 642,
    status: 'UP',
    weight: 100,
  },
];
