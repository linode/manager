import {
  CreateNodeBalancerConfig,
  NodeBalancerConfig,
  UpdateNodeBalancerConfig,
} from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';
import { actionCreatorFactory } from 'typescript-fsa';
import { BalancerParams } from '../nodeBalancer/nodeBalancer.actions';

type Entity = NodeBalancerConfig;

export interface ConfigParams extends BalancerParams {
  nodeBalancerConfigId: number;
}

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancerConfig`);

export type GetAllNodeBalancerConfigsParams = BalancerParams;
export const getAllNodeBalancerConfigsActions = actionCreator.async<
  GetAllNodeBalancerConfigsParams,
  GetAllData<Entity>,
  APIError[]
>(`get-all`);

export type CreateNodeBalancerConfigParams = BalancerParams &
  CreateNodeBalancerConfig;
export const createNodeBalancerConfigActions = actionCreator.async<
  CreateNodeBalancerConfigParams,
  Entity,
  APIError[]
>(`create`);

export type UpdateNodeBalancerConfigParams = ConfigParams &
  UpdateNodeBalancerConfig;
export const updateNodeBalancerConfigActions = actionCreator.async<
  UpdateNodeBalancerConfigParams,
  Entity,
  APIError[]
>(`update`);

export type DeleteNodeBalancerConfigParams = ConfigParams;
export const deleteNodeBalancerConfigActions = actionCreator.async<
  DeleteNodeBalancerConfigParams,
  {},
  APIError[]
>(`delete`);

interface RemoveConfigParams {
  nodeBalancerId: number;
  configIDs: number[];
}
export const removeNodeBalancerConfigs = actionCreator<RemoveConfigParams>(
  `remove-many`
);

interface AddConfigParams {
  nodeBalancerId: number;
  configs: NodeBalancerConfig[];
}
export const addNodeBalancerConfigs = actionCreator<AddConfigParams>(
  `add-many`
);
