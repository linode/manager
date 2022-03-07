import {
  CreateNodeBalancerPayload,
  NodeBalancer,
} from '@linode/api-v4/lib/nodebalancers';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

import { GetAllData } from 'src/utilities/getAll';

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancer`);

export interface BalancerParams {
  nodeBalancerId: number;
}

type Entity = NodeBalancer;

export const getAllNodeBalancersActions = actionCreator.async<
  void,
  GetAllData<NodeBalancer>,
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

/**
 * Request a single page of NBs (for Dashboard and similar).
 * Does *not* include requests for the configs attached to these
 * NBs
 */
export const getNodeBalancersPageActions = actionCreator.async<
  { params?: any; filters?: any },
  ResourcePage<NodeBalancer>,
  APIError[]
>('get-page');
