import { NodeBalancerConfig } from '@linode/api-v4/lib/nodebalancers';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  createNodeBalancerConfig,
  deleteNodeBalancerConfig,
  getAllNodeBalancerConfigs,
  updateNodeBalancerConfig
} from 'src/store/nodeBalancerConfig/nodeBalancerConfig.requests';
import {
  CreateNodeBalancerConfigParams,
  DeleteNodeBalancerConfigParams,
  GetAllNodeBalancerConfigsParams,
  UpdateNodeBalancerConfigParams
} from '../nodeBalancerConfig/nodeBalancerConfig.actions';

export interface WithNodeBalancerConfigActions {
  nodeBalancerConfigActions: {
    getAllNodeBalancerConfigs: (
      params: GetAllNodeBalancerConfigsParams
    ) => Promise<NodeBalancerConfig[]>;
    createNodeBalancerConfig: (
      params: CreateNodeBalancerConfigParams
    ) => Promise<NodeBalancerConfig>;
    deleteNodeBalancerConfig: (
      params: DeleteNodeBalancerConfigParams
    ) => Promise<{}>;
    updateNodeBalancerConfig: (
      params: UpdateNodeBalancerConfigParams
    ) => Promise<NodeBalancerConfig>;
  };
}

export const withNodeBalancerConfigActions = connect(undefined, dispatch => ({
  nodeBalancerConfigActions: bindActionCreators(
    {
      getAllNodeBalancerConfigs,
      createNodeBalancerConfig,
      updateNodeBalancerConfig,
      deleteNodeBalancerConfig
    },
    dispatch
  )
}));
