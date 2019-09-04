import { NodeBalancer } from 'linode-js-sdk/lib/nodebalancers';
import { ExtendedNodeBalancer } from 'src/services/nodebalancers';

export const extendedNodeBalancers: ExtendedNodeBalancer[] = [
  {
    transfer: {
      total: 9.492830276489258,
      out: 0.471893310546875,
      in: 9.020936965942383
    },
    created: '2018-05-18T17:58:39',
    label: 'balancer34999',
    tags: ['tag1'],
    ipv6: '2600:3c00:1::68c8:16ae',
    hostname: 'nb-104-200-22-174.dallas.nodebalancer.linode.com',
    region: 'us-central',
    updated: '2018-05-18T18:37:41',
    ipv4: '104.200.22.174',
    id: 34999,
    client_conn_throttle: 0,
    up: 0,
    down: 0,
    configPorts: [{ configId: 1, port: 80 }]
  },
  {
    transfer: {
      total: 66.79611110687256,
      out: 5.5901947021484375,
      in: 61.20591640472412
    },
    created: '2018-05-04T18:37:25',
    label: 'balancer34740',
    tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    ipv6: '2600:3c00:1::68c8:1688',
    hostname: 'nb-104-200-22-136.dallas.nodebalancer.linode.com',
    region: 'us-central',
    updated: '2018-05-17T16:44:34',
    ipv4: '104.200.22.136',
    id: 34740,
    client_conn_throttle: 0,
    up: 0,
    down: 0,
    configPorts: [{ configId: 1, port: 80 }, { configId: 2, port: 443 }]
  }
];

export const nodeBalancers: NodeBalancer[] = [
  {
    transfer: {
      total: 9.492830276489258,
      out: 0.471893310546875,
      in: 9.020936965942383
    },
    created: '2018-05-18T17:58:39',
    label: 'balancer34999',
    tags: ['tag1', 'tag2', 'tag3'],
    ipv6: '2600:3c00:1::68c8:16ae',
    hostname: 'nb-104-200-22-174.dallas.nodebalancer.linode.com',
    region: 'us-central',
    updated: '2018-05-18T18:37:41',
    ipv4: '104.200.22.174',
    id: 34999,
    client_conn_throttle: 0
  },
  {
    transfer: {
      total: 66.79611110687256,
      out: 5.5901947021484375,
      in: 61.20591640472412
    },
    created: '2018-05-04T18:37:25',
    label: 'balancer34740',
    tags: ['tag4', 'tag5'],
    ipv6: '2600:3c00:1::68c8:1688',
    hostname: 'nb-104-200-22-136.dallas.nodebalancer.linode.com',
    region: 'us-central',
    updated: '2018-05-17T16:44:34',
    ipv4: '104.200.22.136',
    id: 34740,
    client_conn_throttle: 0
  }
];
