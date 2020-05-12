import { NodeBalancerConfigNodeMode } from 'linode-js-sdk/lib/nodebalancers/types';
import { APIError } from 'linode-js-sdk/lib/types';

export interface ExtendedNodeBalancerConfigNode {
  id: number;
  label: string;
  address: string;
  port?: number;
  weight?: number;
  nodebalancer_id: number;
  config_id?: number;
  mode?: NodeBalancerConfigNodeMode;
  modifyStatus?: 'new' | 'delete' | 'update';
  errors?: APIError[];
  status: 'UP' | 'DOWN' | 'unknown';
}
