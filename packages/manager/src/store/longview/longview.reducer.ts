import { LongviewClient } from '@linode/api-v4/lib/longview';
import { clone } from 'ramda';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { EntitiesAsObjectState } from '../types';
import {
  createLongviewClient,
  deleteLongviewClient,
  getLongviewClients,
  updateLongviewClient,
} from './longview.actions';

export type State = EntitiesAsObjectState<LongviewClient>;

export const defaultState: State = {
  data: {},
  error: {},
  lastUpdated: 0,
  loading: false,
  results: 0,
};

const reducer = reducerWithInitialState(defaultState)
  /** START GET ACTIONS */
  .case(getLongviewClients.started, (state) => ({
    ...state,
    error: {
      ...state.error,
      read: undefined,
    },
    loading: true,
  }))
  .caseWithAction(
    getLongviewClients.done,
    (state, { payload: { result } }) => ({
      ...state,
      data: result.data.reduce<Record<number, LongviewClient>>(
        (acc, client) => {
          acc[client.id] = client;
          return acc;
        },
        {}
      ),
      lastUpdated: Date.now(),
      loading: false,
      results: result.results,
    })
  )
  .caseWithAction(getLongviewClients.failed, (state, { payload: result }) => ({
    ...state,
    error: {
      read: result.error,
    },
    loading: false,
  }))
  /** START CREATE ACTIONS */
  .case(createLongviewClient.started, (state) => ({
    ...state,
    error: {
      ...state.error,
      create: undefined,
    },
  }))
  .caseWithAction(
    createLongviewClient.done,
    (state, { payload: { result } }) => ({
      ...state,
      data: {
        ...state.data,
        [result.id]: result,
      },
      lastUpdated: Date.now(),
      results: state.results + 1,
    })
  )
  .caseWithAction(
    createLongviewClient.failed,
    (state, { payload: { error } }) => ({
      ...state,
      error: {
        ...state.error,
        create: error,
      },
    })
  )
  /** START DELETE ACTIONS */
  .case(deleteLongviewClient.started, (state) => ({
    ...state,
    error: {
      ...state.error,
      delete: undefined,
    },
  }))
  .caseWithAction(
    deleteLongviewClient.done,
    (state, { payload: { params } }) => {
      const dataCopy = clone(state.data);

      delete dataCopy[params.id];

      return {
        ...state,
        data: dataCopy,
        lastUpdated: Date.now(),
        results: state.results - 1,
      };
    }
  )
  .caseWithAction(
    deleteLongviewClient.failed,
    (state, { payload: { error } }) => ({
      ...state,
      error: {
        ...state.error,
        delete: error,
      },
    })
  )
  /** START UPDATE ACTIONS */
  .case(updateLongviewClient.started, (state) => ({
    ...state,
    error: {
      ...state.error,
      update: undefined,
    },
  }))
  .caseWithAction(
    updateLongviewClient.done,
    (state, { payload: { params, result } }) => {
      /** update in place */
      const dataCopy = clone(state.data);
      dataCopy[params.id] = result;

      return {
        ...state,
        data: dataCopy,
        lastUpdated: Date.now(),
      };
    }
  )
  .caseWithAction(
    updateLongviewClient.failed,
    (state, { payload: { error } }) => ({
      ...state,
      error: {
        ...state.error,
        update: error,
      },
    })
  )
  .default((state) => state);

export default reducer;
