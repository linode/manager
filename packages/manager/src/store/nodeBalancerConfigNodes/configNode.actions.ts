import {
  CreateNodeBalancerConfigNodePayload as CreateNodeBalancerConfigNode,
  NodeBalancerConfigNode,
  UpdateNodeBalancerConfigNode
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

export interface NodeParams {
  nodeBalancerID: number;
  configID: number;
}

export interface WithNodeID {
  nodeID: number;
}

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancerConfigNode`);

export const requestNodeBalancerConfigNodesActions = actionCreator.async<
  NodeParams,
  NodeBalancerConfigNode[],
  APIError[]
>(`get-all`);

export type CreateNodeBalancerConfigNodeParams = NodeParams &
  CreateNodeBalancerConfigNode;

export const createNodeBalancerConfigNodeActions = actionCreator.async<
  CreateNodeBalancerConfigNodeParams,
  NodeBalancerConfigNode,
  APIError[]
>(`create`);

export type UpdateNodeBalancerConfigNodeParams = NodeParams &
  WithNodeID &
  UpdateNodeBalancerConfigNode;

export const updateNodeBalancerConfigNodeActions = actionCreator.async<
  UpdateNodeBalancerConfigNodeParams,
  NodeBalancerConfigNode,
  APIError[]
>(`update`);

export type DeleteNodeBalancerConfigNodeParams = NodeParams & WithNodeID;

export const deleteNodeBalancerConfigNodeActions = actionCreator.async<
  DeleteNodeBalancerConfigNodeParams,
  {},
  APIError[]
>(`delete`);
