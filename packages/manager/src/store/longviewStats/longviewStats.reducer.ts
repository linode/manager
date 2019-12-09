import { APIError } from 'linode-js-sdk/lib/types';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { RelationalDataSet } from '../types';
import {
  requestClientStats,
  ReturnType as LVClientData
} from './longviewStats.actions';

export type State = RelationalDataSet<LVClientData, APIError[]>;

export const defaultState: State = {};

const reducer = reducerWithInitialState(defaultState)
  /** START GET ACTIONS */
  .caseWithAction(requestClientStats.started, (state, { payload }) => {
    const statsAlreadyExist = !!state[payload.clientID];

    /**
     * only set a loading state if we haven't already gotten
     * stats for this particular Longview Client
     */
    return statsAlreadyExist
      ? state
      : {
          ...state,
          [payload.clientID]: {
            loading: true
          }
        };
  })
  .caseWithAction(
    requestClientStats.done,
    (state, { payload: { result, params } }) => ({
      ...state,
      [params.clientID]: {
        data: result,
        loading: false,
        error: undefined,
        lastUpdated: Date.now()
      }
    })
  )
  .caseWithAction(
    requestClientStats.failed,
    (state, { payload: { error, params } }) => {
      /**
       * at this point, we are guaranteed to have state[params.clientID].loading
       * but we only want to set an error if we don't already have data
       */
      const statsAlreadyExist = !!(state[params.clientID] || {}).data;

      return statsAlreadyExist
        ? state
        : {
            ...state,
            [params.clientID]: {
              loading: false,
              error
            }
          };
    }
  )
  .default(state => state);

export default reducer;
