import {
  NodeBalancer,
  NodeBalancerConfigPort
} from '@linode/api-v4/lib/nodebalancers';

export interface ExtendedNodeBalancer extends NodeBalancer {
  up: number;
  down: number;
  configPorts: NodeBalancerConfigPort[];
}
