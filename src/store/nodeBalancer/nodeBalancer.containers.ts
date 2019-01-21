import { connect } from 'react-redux';
import { CreateNodeBalancerParams, DeleteNodeBalancerParams } from 'src/store/nodeBalancer/nodeBalancer.actions';
import { getAllNodeBalancers } from 'src/store/nodeBalancer/nodeBalancer.requests';
import { createNodeBalancerConfig, deleteNodeBalancerConfig, getAllNodeBalancerConfigs, updateNodeBalancerConfig } from 'src/store/nodeBalancerConfig/nodeBalancerConfig.requests';
import { createNodeBalancerConfigNode, deleteNodeBalancerConfigNode, getAllNodeBalancerConfigNodes, updateNodeBalancerConfigNode } from 'src/store/nodeBalancerConfigNode/nodeBalancerConfigNode.requests';
import { CreateNodeBalancerConfigParams, DeleteNodeBalancerConfigParams, GetAllNodeBalancerConfigsParams, UpdateNodeBalancerConfigParams } from '../nodeBalancerConfig/nodeBalancerConfig.actions';
import { CreateNodeBalancerConfigNodeParams, DeleteNodeBalancerConfigNodeParams, GetAllNodeBalancerConfigNodesParams, UpdateNodeBalancerConfigNodeParams } from '../nodeBalancerConfigNode/nodeBalancerConfigNode.actions';
import { UpdateNodeBalancerParams } from './nodeBalancer.actions';
import { createNodeBalancer, deleteNodeBalancer, updateNodeBalancer } from './nodeBalancer.requests';

export interface WithNodeBalancerActions {
  getAllNodeBalancers: () => Promise<Linode.NodeBalancer[]>;
  createNodeBalancer: (params: CreateNodeBalancerParams) => Promise<Linode.NodeBalancer>;
  deleteNodeBalancer: (params: DeleteNodeBalancerParams) => Promise<{}>;
  updateNodeBalancer: (params: UpdateNodeBalancerParams) => Promise<Linode.NodeBalancer>;

  getAllNodeBalancerConfigs: (params: GetAllNodeBalancerConfigsParams) => Promise<Linode.NodeBalancerConfig[]>;
  createNodeBalancerConfig: (params: CreateNodeBalancerConfigParams) => Promise<Linode.NodeBalancerConfig>;
  deleteNodeBalancerConfig: (params: DeleteNodeBalancerConfigParams) => Promise<{}>;
  updateNodeBalancerConfig: (params: UpdateNodeBalancerConfigParams) => Promise<Linode.NodeBalancerConfig>;

  getAllNodeBalancerConfigNodes: (params: GetAllNodeBalancerConfigNodesParams) => Promise<Linode.NodeBalancerConfigNode[]>;
  createNodeBalancerConfigNode: (params: CreateNodeBalancerConfigNodeParams) => Promise<Linode.NodeBalancerConfigNode>;
  deleteNodeBalancerConfigNode: (params: DeleteNodeBalancerConfigNodeParams) => Promise<{}>;
  updateNodeBalancerConfigNode: (params: UpdateNodeBalancerConfigNodeParams) => Promise<Linode.NodeBalancerConfigNode>;
}

export const withNodeBalancerActions = connect(
  undefined,
  {
    getAllNodeBalancers,
    createNodeBalancer,
    deleteNodeBalancer,
    updateNodeBalancer,

    getAllNodeBalancerConfigs,
    createNodeBalancerConfig,
    updateNodeBalancerConfig,
    deleteNodeBalancerConfig,

    getAllNodeBalancerConfigNodes,
    createNodeBalancerConfigNode,
    deleteNodeBalancerConfigNode,
    updateNodeBalancerConfigNode,
  },
);
