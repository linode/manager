import { LongviewClient } from 'linode-js-sdk/lib/longview';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { EntitiesAsObjectState } from '../types';
import { getLongviewClients } from './longview.actions';

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
  .case(getLongviewClients.started, state => ({
    ...state,
    loading: true
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
  .default(state => state);

export default reducer;
