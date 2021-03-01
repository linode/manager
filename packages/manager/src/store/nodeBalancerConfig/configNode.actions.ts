import {
  CreateNodeBalancerConfigNode,
  NodeBalancerConfigNode,
  UpdateNodeBalancerConfigNode,
} from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';
import { GetAllData } from 'src/utilities/getAll';
import { BalancerParams } from '../nodeBalancer/nodeBalancer.actions';

export interface ConfigParams extends BalancerParams {
  configId: number;
}

export interface NodeParams extends ConfigParams {
  nodeId: number;
}

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancerConfigNode`);

export type GetAllConfigNodesParams = ConfigParams;
export const requestNodeBalancerConfigNodesActions = actionCreator.async<
  GetAllConfigNodesParams,
  GetAllData<NodeBalancerConfigNode>,
  APIError[]
>(`get-all`);

export type CreateNodeBalancerConfigNodeParams = ConfigParams &
  CreateNodeBalancerConfigNode;
export const createNodeBalancerConfigNodeActions = actionCreator.async<
  CreateNodeBalancerConfigNodeParams,
  NodeBalancerConfigNode,
  APIError[]
>(`create`);

export type UpdateNodeBalancerConfigNodeParams = NodeParams &
  UpdateNodeBalancerConfigNode;
export const updateNodeBalancerConfigNodeActions = actionCreator.async<
  UpdateNodeBalancerConfigNodeParams,
  NodeBalancerConfigNode,
  APIError[]
>(`update`);

export type DeleteNodeBalancerConfigNodeParams = NodeParams;
export const deleteNodeBalancerConfigNodeActions = actionCreator.async<
  DeleteNodeBalancerConfigNodeParams,
  {},
  APIError[]
>(`delete`);

export const removeNodeBalancerConfigNodes = actionCreator<number[]>(
  `remove-many`
);

export const addNodeBalancerConfigNodes = actionCreator<
  NodeBalancerConfigNode[]
>(`add-many`);
