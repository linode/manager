import {
  CreateNodeBalancerConfig,
  NodeBalancerConfig,
  UpdateNodeBalancerConfig
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
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
  Entity[],
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

export const removeNodeBalancerConfigs = actionCreator<number[]>(`remove-many`);

export const addNodeBalancerConfigs = actionCreator<NodeBalancerConfig[]>(
  `add-many`
);
