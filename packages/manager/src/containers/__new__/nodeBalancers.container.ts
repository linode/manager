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

const connected: Connected = <ReduxState extends {}, OwnProps extends {}>(
  mapStateToProps?: MapProps<ReduxState, OwnProps>
) =>
  connect<
    (ReduxState & Partial<StateProps>) | StateProps,
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
      if (mapStateToProps) {
        return mapStateToProps(ownProps, {
          nodeBalancersData: itemsById,
          nodeBalancersError: error,
          nodeBalancersLastUpdated: lastUpdated,
          nodeBalancersLoading: loading,
          nodeBalancersResults: items.length
        });
      }

      return {
        nodeBalancersError: error,
        nodeBalancersLoading: loading,
        nodeBalancersData: itemsById,
        nodeBalancersResults: items.length,
        nodeBalancersLastUpdated: lastUpdated
      };
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
