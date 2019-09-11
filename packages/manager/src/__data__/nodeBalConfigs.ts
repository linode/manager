import { NodeBalancerConfigNode } from 'linode-js-sdk/lib/nodebalancers';

export const nodes: NodeBalancerConfigNode[] = [
  {
    label: 'config 1',
    nodebalancer_id: 642,
    mode: 'accept',
    address: '192.168.160.160:80',
    status: 'UP',
    config_id: 1,
    id: 571,
    weight: 100
  },
  {
    label: 'config 2',
    nodebalancer_id: 642,
    mode: 'accept',
    address: '192.168.160.160:80',
    status: 'UP',
    config_id: 1,
    id: 572,
    weight: 100
  },
  {
    label: 'config 3',
    nodebalancer_id: 642,
    mode: 'accept',
    address: '192.168.160.160:80',
    status: 'UP',
    config_id: 1,
    id: 573,
    weight: 100
  }
];
