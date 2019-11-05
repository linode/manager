import { NodeBalancerConfigNode } from 'linode-js-sdk/lib/nodebalancers';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/nodeBalancerConfigNodes/configNode.reducer';
import {
  createNodeBalancerConfigNode as _create,
  deleteNodeBalancerConfigNode as _delete,
  getAllNodeBalancerConfigNodes as _getAll,
  updateNodeBalancerConfigNode as _update
} from 'src/store/nodeBalancerConfigNodes/configNode.requests';
import { ThunkDispatch } from 'src/store/types';

import {
  CreateNodeBalancerConfigNodeParams,
  DeleteNodeBalancerConfigNodeParams,
  NodeParams,
  UpdateNodeBalancerConfigNodeParams
} from 'src/store/nodeBalancerConfigNodes/configNode.actions';

export interface DispatchProps {
  getAllNodeBalancerConfigNodes: (
    payload: NodeParams
  ) => Promise<NodeBalancerConfigNode[]>;
  createNodeBalancerConfigNode: (
    payload: CreateNodeBalancerConfigNodeParams
  ) => Promise<NodeBalancerConfigNode>;
  deleteNodeBalancerConfigNode: (
    payload: DeleteNodeBalancerConfigNodeParams
  ) => Promise<{}>;
  updateNodeBalancerConfigNode: (
    params: UpdateNodeBalancerConfigNodeParams
  ) => Promise<NodeBalancerConfigNode>;
}

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  data: State
) => ReduxStateProps & Partial<State>;

export type Props = DispatchProps & State;

interface Connected {
  <ReduxStateProps, OwnProps>(
    configID: number,
    mapStateToProps: MapProps<ReduxStateProps, OwnProps>
  ): InferableComponentEnhancerWithProps<
    ReduxStateProps & Partial<State> & DispatchProps & OwnProps,
    OwnProps
  >;
  <ReduxStateProps, OwnProps>(
    configID: number
  ): InferableComponentEnhancerWithProps<
    ReduxStateProps & DispatchProps & OwnProps,
    OwnProps
  >;
}

const connected: Connected = <ReduxState extends {}, OwnProps extends {}>(
  configID: number,
  mapStateToProps?: MapProps<ReduxState, OwnProps>
) =>
  connect<
    (ReduxState & Partial<State>) | State,
    DispatchProps,
    OwnProps,
    ApplicationState
  >(
    (state, ownProps) => {
      const { nodeBalancerConfigNodes } = state.__resources;
      const configNodesForAConfig = Object.keys(nodeBalancerConfigNodes).reduce(
        (acc, eachKey) => {
          if (+eachKey === configID) {
            acc[eachKey] = nodeBalancerConfigNodes[eachKey];
          }
          return acc;
        },
        {}
      );

      if (mapStateToProps) {
        return mapStateToProps(ownProps, configNodesForAConfig);
      }

      return configNodesForAConfig;
    },
    (dispatch: ThunkDispatch) => ({
      getAllNodeBalancerConfigNodes: params => dispatch(_getAll(params)),
      createNodeBalancerConfigNode: payload => dispatch(_create(payload)),
      deleteNodeBalancerConfigNode: payload => dispatch(_delete(payload)),
      updateNodeBalancerConfigNode: payload => dispatch(_update(payload))
    })
  );

export default connected;
