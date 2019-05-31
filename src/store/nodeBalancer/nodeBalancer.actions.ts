import { CreateNodeBalancerPayload } from 'src/services/nodebalancers';
import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancer`);

export interface BalancerParams {
  nodeBalancerId: number;
}

type Entity = Linode.NodeBalancer;

export const getAllNodeBalancersActions = actionCreator.async<
  void,
  Linode.NodeBalancer[],
  Linode.ApiFieldError[]
>(`get-all`);

export type CreateNodeBalancerParams = CreateNodeBalancerPayload;

export const createNodeBalancersActions = actionCreator.async<
  CreateNodeBalancerParams,
  Entity,
  Linode.ApiFieldError[]
>(`create`);

/** We require the ID in the action, if we just did Partial<NB> that makes id number | undefined */
export type UpdateNodeBalancerParams = BalancerParams & Partial<Entity>;

export const updateNodeBalancersActions = actionCreator.async<
  UpdateNodeBalancerParams,
  Entity,
  Linode.ApiFieldError[]
>(`update`);

export type DeleteNodeBalancerParams = BalancerParams;

export const deleteNodeBalancerActions = actionCreator.async<
  DeleteNodeBalancerParams,
  {},
  Linode.ApiFieldError[]
>(`delete`);

export type GetNodeBalancerWithConfigsParams = BalancerParams;

export const getNodeBalancerWithConfigsActions = actionCreator.async<
  GetNodeBalancerWithConfigsParams,
  Linode.NodeBalancer,
  Linode.ApiFieldError[]
>(`get`);
