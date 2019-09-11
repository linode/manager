import {
  NodeBalancer,
  NodeBalancerConfigPort
} from 'linode-js-sdk/lib/nodebalancers';

export interface ExtendedNodeBalancer extends NodeBalancer {
  up: number;
  down: number;
  configPorts: NodeBalancerConfigPort[];
}
