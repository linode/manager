import { NodeBalancerConfigNode } from 'linode-js-sdk/lib/nodebalancers';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import {
  // createNodeBalancerConfigNodeActions,
  // deleteNodeBalancerConfigNodeActions,
  requestNodeBalancerConfigNodesActions
  // updateNodeBalancerConfigNodeActions
} from './configNode.actions';

import { RelationalDataSet } from '../types';

/**
 * State
 */

export type State = RelationalDataSet<NodeBalancerConfigNode[]>;

export const defaultState: State = {};

const reducer = reducerWithInitialState(defaultState)
  .case(requestNodeBalancerConfigNodesActions.started, state => ({
    /** do nothing. We don't need each config to have it's own loading state. */
    ...state
  }))
  .caseWithAction(
    requestNodeBalancerConfigNodesActions.done,
    (state, { payload: { result, params } }) => ({
      ...state,
      [params.configID]: {
        data: result,
        loading: false,
        error: {}
      }
    })
  )
  .caseWithAction(
    requestNodeBalancerConfigNodesActions.failed,
    (state, { payload: { params, error } }) => ({
      ...state,
      [params.configID]: {
        loading: false,
        error: {
          read: error
        }
      }
    })
  )
  .default(state => state);

export default reducer;
