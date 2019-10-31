import { NodeBalancerConfig } from 'linode-js-sdk/lib/nodebalancers';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/nodeBalancerConfig/nodeBalancerConfig.reducer';
import {
  createNodeBalancerConfig as _create,
  deleteNodeBalancerConfig as _delete,
  getAllNodeBalancerConfigs as _getAll,
  updateNodeBalancerConfig as _update
} from 'src/store/nodeBalancerConfig/nodeBalancerConfig.requests';
import { ThunkDispatch } from 'src/store/types';

import {
  CreateNodeBalancerConfigParams,
  UpdateNodeBalancerConfigParams
} from 'src/store/nodeBalancerConfig/nodeBalancerConfig.actions';

export interface DispatchProps {
  getAllNodeBalancerConfigs: (id: number) => Promise<NodeBalancerConfig[]>;
  createNodeBalancerConfig: (
    payload: CreateNodeBalancerConfigParams
  ) => Promise<NodeBalancerConfig>;
  deleteNodeBalancerConfig: (
    configId: number,
    nodeBalancerId: number
  ) => Promise<{}>;
  updateNodeBalancerConfig: (
    params: UpdateNodeBalancerConfigParams
  ) => Promise<NodeBalancerConfig>;
}

/* tslint:disable-next-line */
export interface StateProps {
  nodeBalancerConfigsError: State['error'];
  nodeBalancerConfigsLoading: State['loading'];
  nodeBalancerConfigsData: State['itemsById'];
  nodeBalancerConfigsLastUpdated: State['lastUpdated'];
  nodeBalancerConfigsResults: number;
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
      } = state.__resources.nodeBalancerConfigs;
      if (mapStateToProps) {
        return mapStateToProps(ownProps, {
          nodeBalancerConfigsData: itemsById,
          nodeBalancerConfigsError: error,
          nodeBalancerConfigsLastUpdated: lastUpdated,
          nodeBalancerConfigsLoading: loading,
          nodeBalancerConfigsResults: items.length
        });
      }

      return {
        nodeBalancerConfigsError: error,
        nodeBalancerConfigsLoading: loading,
        nodeBalancerConfigsData: itemsById,
        nodeBalancerConfigsResults: items.length,
        nodeBalancerConfigsLastUpdated: lastUpdated
      };
    },
    (dispatch: ThunkDispatch) => ({
      getAllNodeBalancerConfigs: id =>
        dispatch(_getAll({ nodeBalancerId: id })),
      createNodeBalancerConfig: payload => dispatch(_create(payload)),
      deleteNodeBalancerConfig: (configId, nodeBalancerId) =>
        dispatch(_delete({ nodeBalancerConfigId: configId, nodeBalancerId })),
      updateNodeBalancerConfig: payload => dispatch(_update(payload))
    })
  );

export default connected;
