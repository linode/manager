import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { connect } from 'react-redux';
import { Action, bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import {
  CreateNodeBalancerParams,
  DeleteNodeBalancerParams,
} from 'src/store/nodeBalancer/nodeBalancer.actions';
import {
  getAllNodeBalancers,
  getAllNodeBalancersWithConfigs,
  getNodeBalancersPage,
  getNodeBalancerWithConfigs,
} from 'src/store/nodeBalancer/nodeBalancer.requests';
import { UpdateNodeBalancerParams } from './nodeBalancer.actions';
import {
  createNodeBalancer,
  deleteNodeBalancer,
  updateNodeBalancer,
} from './nodeBalancer.requests';

export interface WithNodeBalancerActions {
  nodeBalancerActions: {
    getAllNodeBalancersWithConfigs: () => Promise<void>;
    getNodeBalancerWithConfigs: (nodeBalancerID: number) => Promise<void>;
    getNodeBalancerPage: (params?: any, filters?: any) => Promise<void>;
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
  (dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>) => ({
    nodeBalancerActions: {
      ...bindActionCreators(
        {
          getAllNodeBalancersWithConfigs,
          getAllNodeBalancers,
          createNodeBalancer,
          deleteNodeBalancer,
          updateNodeBalancer,
        },
        dispatch
      ),
      getNodeBalancerPage: (params: any = {}, filters: any = {}) =>
        dispatch(getNodeBalancersPage({ params, filters })),
      getNodeBalancerWithConfigs: (nodeBalancerId: number) =>
        dispatch(getNodeBalancerWithConfigs({ nodeBalancerId })),
    },
  })
);
