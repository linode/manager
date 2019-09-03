import {
  CreateNodeBalancerConfigNode,
  UpdateNodeBalancerConfigNode
} from 'src/services/nodebalancers';
import { actionCreatorFactory } from 'typescript-fsa';
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
  Linode.NodeBalancerConfigNode[],
  Linode.ApiFieldError[]
>(`get-all`);

export type CreateNodeBalancerConfigNodeParams = ConfigParams &
  CreateNodeBalancerConfigNode;
export const createNodeBalancerConfigNodeActions = actionCreator.async<
  CreateNodeBalancerConfigNodeParams,
  Linode.NodeBalancerConfigNode,
  Linode.ApiFieldError[]
>(`create`);

export type UpdateNodeBalancerConfigNodeParams = NodeParams &
  UpdateNodeBalancerConfigNode;
export const updateNodeBalancerConfigNodeActions = actionCreator.async<
  UpdateNodeBalancerConfigNodeParams,
  Linode.NodeBalancerConfigNode,
  Linode.ApiFieldError[]
>(`update`);

export type DeleteNodeBalancerConfigNodeParams = NodeParams;
export const deleteNodeBalancerConfigNodeActions = actionCreator.async<
  DeleteNodeBalancerConfigNodeParams,
  {},
  Linode.ApiFieldError[]
>(`delete`);

export const removeNodeBalancerConfigNodes = actionCreator<number[]>(
  `remove-many`
);

export const addNodeBalancerConfigNodes = actionCreator<
  Linode.NodeBalancerConfigNode[]
>(`add-many`);
