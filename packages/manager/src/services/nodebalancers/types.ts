import {
  NodeBalancer,
  NodeBalancerConfig
} from 'linode-js-sdk/lib/nodebalancers';

interface NodeBalancerConfigPort {
  configId: number;
  port: number;
}

export interface ExtendedNodeBalancer extends NodeBalancer {
  up: number;
  down: number;
  configPorts: NodeBalancerConfigPort[];
}

export interface NodeBalancerWithConfigs extends NodeBalancer {
  configs: NodeBalancerConfig[];
}
