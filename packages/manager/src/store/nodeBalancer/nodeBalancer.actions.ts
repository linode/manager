import {
  CreateNodeBalancerPayload,
  NodeBalancer
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancer`);

export interface BalancerParams {
  nodeBalancerId: number;
}

type Entity = NodeBalancer;

export const getAllNodeBalancersActions = actionCreator.async<
  void,
  NodeBalancer[],
  APIError[]
>(`get-all`);

export type CreateNodeBalancerParams = CreateNodeBalancerPayload;

export const createNodeBalancersActions = actionCreator.async<
  CreateNodeBalancerParams,
  Entity,
  APIError[]
>(`create`);

/** We require the ID in the action, if we just did Partial<NB> that makes id number | undefined */
export type UpdateNodeBalancerParams = BalancerParams & Partial<Entity>;

export const updateNodeBalancersActions = actionCreator.async<
  UpdateNodeBalancerParams,
  Entity,
  APIError[]
>(`update`);

export type DeleteNodeBalancerParams = BalancerParams;

export const deleteNodeBalancerActions = actionCreator.async<
  DeleteNodeBalancerParams,
  {},
  APIError[]
>(`delete`);

export type GetNodeBalancerWithConfigsParams = BalancerParams;

export const getNodeBalancerWithConfigsActions = actionCreator.async<
  GetNodeBalancerWithConfigsParams,
  NodeBalancer,
  APIError[]
>(`get`);
