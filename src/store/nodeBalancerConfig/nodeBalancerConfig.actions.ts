import { CreateNodeBalancerConfig, NodeBalancerConfig, UpdateNodeBalancerConfig } from 'src/services/nodebalancers';
import { actionCreatorFactory } from 'typescript-fsa';
import { BalancerParams } from '../nodeBalancer/nodeBalancer.actions';
import { Entity } from '../types';

export interface ConfigParams extends BalancerParams { nodeBalancerConfigId: number };

const actionCreator = actionCreatorFactory(`@@manager/nodeBalancerConfig`);

export type GetAllNodeBalancerConfigsParams = BalancerParams;
export const getAllNodeBalancerConfigsActions = actionCreator.async<GetAllNodeBalancerConfigsParams, NodeBalancerConfig[], Linode.ApiFieldError[]>(`get-all`);

export type CreateNodeBalancerConfigParams = BalancerParams & CreateNodeBalancerConfig;
export const createNodeBalancerConfigActions = actionCreator.async<CreateNodeBalancerConfigParams, Entity, Linode.ApiFieldError[]>(`create`);

export type UpdateNodeBalancerConfigParams = ConfigParams & UpdateNodeBalancerConfig;
export const updateNodeBalancerConfigActions = actionCreator.async<UpdateNodeBalancerConfigParams, Entity, Linode.ApiFieldError[]>(`update`);

export type DeleteNodeBalancerConfigParams = ConfigParams;
export const deleteNodeBalancerConfigActions = actionCreator.async<ConfigParams, {}, Linode.ApiFieldError[]>(`delete`);
