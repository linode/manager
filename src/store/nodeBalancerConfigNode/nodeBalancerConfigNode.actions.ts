import { CreateNodeBalancerConfigNode, NodeBalancerConfigNode, UpdateNodeBalancerConfigNode } from 'src/services/nodebalancers';
import { actionCreatorFactory } from 'typescript-fsa';
import { ConfigParams } from '../nodeBalancerConfig/nodeBalancerConfig.actions';

interface NodeParams extends ConfigParams { nodeBalancerConfigNodeId: number; }

const nodeActionCreator = actionCreatorFactory(`@@manager/nodeBalancerConfigNode`);

export type GetAllNodeBalancerConfigNodesParams = ConfigParams;
export const getAllNodeBalancerConfigNodesActions = nodeActionCreator.async<GetAllNodeBalancerConfigNodesParams, NodeBalancerConfigNode[], Linode.ApiFieldError[]>(`get-all`);

export type CreateNodeBalancerConfigNodeParams = ConfigParams & CreateNodeBalancerConfigNode;
export const createNodeBalancerConfigNodesActions = nodeActionCreator.async<CreateNodeBalancerConfigNodeParams, NodeBalancerConfigNode, Linode.ApiFieldError[]>(`create`);

export type UpdateNodeBalancerConfigNodeParams = NodeParams & UpdateNodeBalancerConfigNode;
export const updateNodeBalancerConfigNodesActions = nodeActionCreator.async<UpdateNodeBalancerConfigNodeParams, NodeBalancerConfigNode, Linode.ApiFieldError[]>(`update`);

export type DeleteNodeBalancerConfigNodeParams = NodeParams;
export const deleteNodeBalancerConfigNodesActions = nodeActionCreator.async<DeleteNodeBalancerConfigNodeParams, {}, Linode.ApiFieldError[]>(`delete`);
