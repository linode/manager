import { apiTestRegion } from './regions';

function createTestNodeBalancer(id) {
  return {
    label: `nodebalancer-${id}`,
    group: `group-${id}`,
    region: apiTestRegion,
    status: 'new_active',
    updated: '2017-03-06T22:00:48',
    created: '2017-03-03T18:08:44',
    hostname: 'nb-1-1-1-1.newark.nodebalancer.linode.com',
    id: 23,
    client_conn_throttle: 0,
    ipv4: '1.1.1.1',
    _configs: {
      configs: {
        0: {
          check_timeout: 30,
          nodebalancer_id: 23,
          check_path: '',
          check_attempts: 3,
          id: 0,
          label: 'none',
          check_interval: 0,
          protocol: 'http',
          algorithm: 'roundrobin',
          cipher_suite: 'recommended',
          stickiness: 'none',
          check_passive: 1,
          port: 80,
          check_body: '',
          check: 'none',
          _nodes: {
            nodes: {
              0: {
                nodebalancer_id: 23,
                id: 0,
                mode: 'accept',
                address: '192.168.4.5:80',
                label: 'greatest_node_ever',
                weight: 40,
                config_id: 0,
                status: 'online',
              },
            },
          },
        },
        1: {
          check_timeout: 30,
          nodebalancer_id: 23,
          check_path: '',
          check_attempts: 3,
          id: 1,
          label: 'none',
          check_interval: 0,
          protocol: 'http',
          algorithm: 'roundrobin',
          cipher_suite: 'recommended',
          stickiness: 'none',
          check_passive: 1,
          port: 81,
          check_body: '',
          check: 'none',
        },
      },
    },
  };
}

export const genericNodeBalancer = createTestNodeBalancer(1);

export const noGroupNodeBalancer = {
  ...createTestNodeBalancer(2),
  group: '',
};

export const nodebalancers = [
  genericNodeBalancer,
  noGroupNodeBalancer,
].reduce((object, nodebalancer) => ({ ...object, [nodebalancer.id]: nodebalancer }), {});
