import { connect } from 'react-redux';
import { CreateNodeBalancerParams, DeleteNodeBalancerParams } from 'src/store/nodeBalancer/nodeBalancer.actions';
import { getAllNodeBalancers, getAllNodeBalancersWithConfigs } from 'src/store/nodeBalancer/nodeBalancer.requests';
import { createNodeBalancerConfig, deleteNodeBalancerConfig, getAllNodeBalancerConfigs, updateNodeBalancerConfig } from 'src/store/nodeBalancerConfig/nodeBalancerConfig.requests';
import { CreateNodeBalancerConfigParams, DeleteNodeBalancerConfigParams, GetAllNodeBalancerConfigsParams, UpdateNodeBalancerConfigParams } from '../nodeBalancerConfig/nodeBalancerConfig.actions';
import { UpdateNodeBalancerParams } from './nodeBalancer.actions';
import { createNodeBalancer, deleteNodeBalancer, updateNodeBalancer } from './nodeBalancer.requests';


export interface WithNodeBalancerActions {
  getAllNodeBalancersWithConfigs: () => Promise<void>;
  getAllNodeBalancers: () => Promise<Linode.NodeBalancer[]>;
  createNodeBalancer: (params: CreateNodeBalancerParams) => Promise<Linode.NodeBalancer>;
  deleteNodeBalancer: (params: DeleteNodeBalancerParams) => Promise<{}>;
  updateNodeBalancer: (params: UpdateNodeBalancerParams) => Promise<Linode.NodeBalancer>;

  getAllNodeBalancerConfigs: (params: GetAllNodeBalancerConfigsParams) => Promise<Linode.NodeBalancerConfig[]>;
  createNodeBalancerConfig: (params: CreateNodeBalancerConfigParams) => Promise<Linode.NodeBalancerConfig>;
  deleteNodeBalancerConfig: (params: DeleteNodeBalancerConfigParams) => Promise<{}>;
  updateNodeBalancerConfig: (params: UpdateNodeBalancerConfigParams) => Promise<Linode.NodeBalancerConfig>;
}

export const withNodeBalancerActions = connect(
  undefined,
  {
    getAllNodeBalancersWithConfigs,

    getAllNodeBalancers,
    createNodeBalancer,
    deleteNodeBalancer,
    updateNodeBalancer,

    getAllNodeBalancerConfigs,
    createNodeBalancerConfig,
    updateNodeBalancerConfig,
    deleteNodeBalancerConfig,
  },
);
