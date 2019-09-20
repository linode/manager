import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { EntitiesAsObjectState } from '../types';
import { getFirewalls } from './firewalls.actions';

export type State = EntitiesAsObjectState<Firewall>;

export const defaultState: State = {
  loading: false,
  lastUpdated: 0,
  results: 0,
  data: {},
  error: {},
  listOfIDsInOriginalOrder: []
};

const reducer = reducerWithInitialState(defaultState)
  .case(getFirewalls.started, state => ({
    ...state,
    loading: true
  }))
  .caseWithAction(getFirewalls.done, (state, { payload: { result } }) => ({
    ...state,
    data: result.data.reduce((acc, eachFirewall) => {
      acc[eachFirewall.id] = eachFirewall;
      return acc;
    }, {}),
    loading: false,
    results: result.results,
    listOfIDsInOriginalOrder: result.data.map(eachFirewall => eachFirewall.id),
    lastUpdated: Date.now()
  }))
  .caseWithAction(getFirewalls.failed, (state, { payload: result }) => ({
    ...state,
    error: {
      read: result.error
    },
    loading: false
  }))
  .default(state => state);

export default reducer;
