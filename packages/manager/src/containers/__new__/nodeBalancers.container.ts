import {
  CreateNodeBalancerPayload,
  NodeBalancer
} from 'linode-js-sdk/lib/nodebalancers';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/nodeBalancer/nodeBalancer.reducer';
import {
  createNodeBalancer as _create,
  deleteNodeBalancer as _delete,
  getAllNodeBalancersWithConfigs as getAllNodeBalancersAndConfigs,
  updateNodeBalancer as _update
} from 'src/store/nodeBalancer/nodeBalancer.requests';
import { ThunkDispatch } from 'src/store/types';

import { UpdateNodeBalancerParams } from 'src/store/nodeBalancer/nodeBalancer.actions';

export interface DispatchProps {
  getAllNodeBalancersAndConfigs: () => Promise<void>;
  createNodeBalancer: (
    payload: CreateNodeBalancerPayload
  ) => Promise<NodeBalancer>;
  deleteNodeBalancer: (id: number) => Promise<{}>;
  updateNodeBalancer: (
    params: UpdateNodeBalancerParams
  ) => Promise<NodeBalancer>;
}

export interface StateProps {
  nodeBalancersError: State['error'];
  nodeBalancersLoading: State['loading'];
  nodeBalancersData: State['itemsById'];
  nodeBalancersLastUpdated: State['lastUpdated'];
  nodeBalancersResults: number;
}

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  data: StateProps
) => ReduxStateProps & Partial<StateProps>;

export type Props = DispatchProps & StateProps;

interface Connected {
  <ReduxStateProps, OwnProps>(
    mapStateToProps: MapProps<ReduxStateProps, OwnProps>
  ): InferableComponentEnhancerWithProps<
    ReduxStateProps & Partial<StateProps> & DispatchProps & OwnProps,
    OwnProps
  >;
  <ReduxStateProps, OwnProps>(): InferableComponentEnhancerWithProps<
    ReduxStateProps & DispatchProps & OwnProps,
    OwnProps
  >;
}

const connected: Connected = <ReduxStateProps extends {}, OwnProps extends {}>(
  mapStateToProps?: MapProps<ReduxStateProps, OwnProps>
) =>
  connect<
    (ReduxStateProps & Partial<StateProps>) | StateProps,
    DispatchProps,
    OwnProps,
    ApplicationState
  >(
    (state, ownProps) => {
      const {
        loading,
        error,
        items,
        itemsById,
        lastUpdated
      } = state.__resources.nodeBalancers;

      const result = {
        nodeBalancersData: itemsById,
        nodeBalancersError: error,
        nodeBalancersLastUpdated: lastUpdated,
        nodeBalancersLoading: loading,
        nodeBalancersResults: items.length
      };

      return mapStateToProps ? mapStateToProps(ownProps, result) : result;
    },
    (dispatch: ThunkDispatch) => ({
      getAllNodeBalancersAndConfigs: () =>
        dispatch(getAllNodeBalancersAndConfigs()),
      createNodeBalancer: payload => dispatch(_create(payload)),
      deleteNodeBalancer: id => dispatch(_delete({ nodeBalancerId: id })),
      updateNodeBalancer: payload => dispatch(_update(payload))
    })
  );

export default connected;
