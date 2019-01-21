import { CreateNodeBalancerConfigNode, NodeBalancerConfigNode, UpdateNodeBalancerConfigNode } from 'src/services/nodebalancers';
import { actionCreatorFactory } from 'typescript-fsa';
import { ConfigParams } from '../nodeBalancerConfig/nodeBalancerConfig.actions';

type Entity = NodeBalancerConfigNode;
interface NodeParams extends ConfigParams { nodeBalancerConfigNodeId: number; }

const nodeActionCreator = actionCreatorFactory(`@@manager/nodeBalancerConfigNode`);

export type GetAllNodeBalancerConfigNodesParams = ConfigParams;
export const getAllNodeBalancerConfigNodesActions = nodeActionCreator.async<GetAllNodeBalancerConfigNodesParams, Entity[], Linode.ApiFieldError[]>(`get-all`);

export type CreateNodeBalancerConfigNodeParams = ConfigParams & CreateNodeBalancerConfigNode;
export const createNodeBalancerConfigNodesActions = nodeActionCreator.async<CreateNodeBalancerConfigNodeParams, Entity, Linode.ApiFieldError[]>(`create`);

export type UpdateNodeBalancerConfigNodeParams = NodeParams & UpdateNodeBalancerConfigNode;
export const updateNodeBalancerConfigNodesActions = nodeActionCreator.async<UpdateNodeBalancerConfigNodeParams, Entity, Linode.ApiFieldError[]>(`update`);

export type DeleteNodeBalancerConfigNodeParams = NodeParams;
export const deleteNodeBalancerConfigNodesActions = nodeActionCreator.async<DeleteNodeBalancerConfigNodeParams, {}, Linode.ApiFieldError[]>(`delete`);

export const removeNodeBalancerConfigNodes = nodeActionCreator<number[]>(`remove-many`)

export const addNodeBalancerConfigNodes = nodeActionCreator<NodeBalancerConfigNode[]>(`add-many`)
