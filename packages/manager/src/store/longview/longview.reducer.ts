import { LongviewClient } from 'linode-js-sdk/lib/longview';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { EntitiesAsObjectState } from '../types';
import { createLongviewClient, getLongviewClients } from './longview.actions';

export type State = EntitiesAsObjectState<LongviewClient>;

export const defaultState: State = {
  loading: false,
  lastUpdated: 0,
  results: 0,
  data: {},
  error: {},
  listOfIDsInOriginalOrder: []
};

const reducer = reducerWithInitialState(defaultState)
  /** START GET ACTIONS */
  .case(getLongviewClients.started, state => ({
    ...state,
    loading: true,
    error: {
      ...state.error,
      read: undefined
    }
  }))
  .caseWithAction(
    getLongviewClients.done,
    (state, { payload: { result } }) => ({
      ...state,
      data: result.data.reduce((acc, client) => {
        acc[client.id] = client;
        return acc;
      }, {}),
      loading: false,
      results: result.results,
      listOfIDsInOriginalOrder: result.data.map(
        eachFirewall => eachFirewall.id
      ),
      lastUpdated: Date.now()
    })
  )
  .caseWithAction(getLongviewClients.failed, (state, { payload: result }) => ({
    ...state,
    error: {
      read: result.error
    },
    loading: false
  }))
  /** START CREATE ACTIONS */
  .case(createLongviewClient.started, state => ({
    ...state,
    error: {
      ...state.error,
      create: undefined
    }
  }))
  .caseWithAction(
    createLongviewClient.done,
    (state, { payload: { result } }) => ({
      ...state,
      data: {
        ...state.data,
        [result.id]: result
      },
      results: state.results + 1,
      listOfIDsInOriginalOrder: [...state.listOfIDsInOriginalOrder, result.id],
      lastUpdated: Date.now()
    })
  )
  .caseWithAction(
    createLongviewClient.failed,
    (state, { payload: { error } }) => ({
      ...state,
      error: {
        ...state.error,
        create: error
      }
    })
  )

  .default(state => state);

export default reducer;
