import { NodeBalancerConfigNode } from 'linode-js-sdk/lib/nodebalancers';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/nodeBalancerConfig/configNode.reducer';
import {
  createNodeBalancerConfigNode as _create,
  deleteNodeBalancerConfigNode as _delete,
  getAllNodeBalancerConfigNodes as _getAll,
  updateNodeBalancerConfigNode as _update
} from 'src/store/nodeBalancerConfig/configNode.requests';
import { ThunkDispatch } from 'src/store/types';

import {
  CreateNodeBalancerConfigNodeParams,
  GetAllConfigNodesParams,
  NodeParams,
  UpdateNodeBalancerConfigNodeParams
} from 'src/store/nodeBalancerConfig/configNode.actions';

export interface DispatchProps {
  getAllNodeBalancerConfigNodes: (
    payload: GetAllConfigNodesParams
  ) => Promise<NodeBalancerConfigNode[]>;
  createNodeBalancerConfigNode: (
    payload: CreateNodeBalancerConfigNodeParams
  ) => Promise<NodeBalancerConfigNode>;
  deleteNodeBalancerConfigNode: (payload: NodeParams) => Promise<{}>;
  updateNodeBalancerConfigNode: (
    params: UpdateNodeBalancerConfigNodeParams
  ) => Promise<NodeBalancerConfigNode>;
}

export interface StateProps {
  nodeBalancerConfigNodesError: State['error'];
  nodeBalancerConfigNodesLoading: State['loading'];
  nodeBalancerConfigNodesData: State['entities'];
  nodeBalancerConfigNodesLastUpdated: State['lastUpdated'];
  nodeBalancerConfigNodesResults: number;
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
        entities,
        results,
        lastUpdated
      } = state.__resources.nodeBalancerConfigNodes;
      if (mapStateToProps) {
        return mapStateToProps(ownProps, {
          nodeBalancerConfigNodesData: entities,
          nodeBalancerConfigNodesError: error,
          nodeBalancerConfigNodesLastUpdated: lastUpdated,
          nodeBalancerConfigNodesLoading: loading,
          nodeBalancerConfigNodesResults: results.length
        });
      }

      return {
        nodeBalancerConfigNodesError: error,
        nodeBalancerConfigNodesLoading: loading,
        nodeBalancerConfigNodesData: entities,
        nodeBalancerConfigNodesResults: results.length,
        nodeBalancerConfigNodesLastUpdated: lastUpdated
      };
    },
    (dispatch: ThunkDispatch) => ({
      getAllNodeBalancerConfigNodes: params => dispatch(_getAll(params)),
      createNodeBalancerConfigNode: payload => dispatch(_create(payload)),
      deleteNodeBalancerConfigNode: payload => dispatch(_delete(payload)),
      updateNodeBalancerConfigNode: payload => dispatch(_update(payload))
    })
  );

export default connected;
