import { NodeBalancer } from 'linode-js-sdk/lib/nodebalancers';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  CreateNodeBalancerParams,
  DeleteNodeBalancerParams
} from 'src/store/nodeBalancer/nodeBalancer.actions';
import {
  getAllNodeBalancers,
  getAllNodeBalancersWithConfigs
} from 'src/store/nodeBalancer/nodeBalancer.requests';
import { UpdateNodeBalancerParams } from './nodeBalancer.actions';
import {
  createNodeBalancer,
  deleteNodeBalancer,
  updateNodeBalancer
} from './nodeBalancer.requests';

export interface WithNodeBalancerActions {
  nodeBalancerActions: {
    getAllNodeBalancersWithConfigs: () => Promise<void>;
    getAllNodeBalancers: () => Promise<NodeBalancer[]>;
    createNodeBalancer: (
      params: CreateNodeBalancerParams
    ) => Promise<NodeBalancer>;
    deleteNodeBalancer: (params: DeleteNodeBalancerParams) => Promise<{}>;
    updateNodeBalancer: (
      params: UpdateNodeBalancerParams
    ) => Promise<NodeBalancer>;
  };
}

export const withNodeBalancerActions = connect(
  undefined,
  dispatch => ({
    nodeBalancerActions: bindActionCreators(
      {
        getAllNodeBalancersWithConfigs,
        getAllNodeBalancers,
        createNodeBalancer,
        deleteNodeBalancer,
        updateNodeBalancer
      },
      dispatch
    )
  })
);
