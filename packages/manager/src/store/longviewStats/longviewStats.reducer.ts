import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { requestClientStats } from './longviewStats.actions';

import type { RelationalDataSet } from '../types';
import type {
  LongviewNotification,
  LongviewResponse,
} from 'src/features/Longview/request.types';

export type State = RelationalDataSet<
  LongviewResponse['DATA'],
  LongviewNotification[]
>;

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
            loading: true,
          },
        };
  })
  .caseWithAction(
    requestClientStats.done,
    (state, { payload: { params, result } }) => ({
      ...state,
      [params.clientID]: {
        data: result,
        error: undefined,
        lastUpdated: Date.now(),
        loading: false,
      },
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
              error,
              loading: false,
            },
          };
    }
  )
  .default((state) => state);

export default reducer;
