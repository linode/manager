import { Firewall, FirewallRuleType } from 'linode-js-sdk/lib/firewalls';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { EntitiesAsObjectState } from '../types';
import { getFirewalls } from './firewalls.actions';

interface FirewallRuleTypeWithSequence extends FirewallRuleType {
  sequence: number;
}

interface FirewallRuleWithSequence {
  inbound?: FirewallRuleTypeWithSequence[] | null;
  outbound?: FirewallRuleTypeWithSequence[] | null;
}

export interface FirewallWithSequence extends Omit<Firewall, 'rules'> {
  rules: FirewallRuleWithSequence[];
}

export type State = EntitiesAsObjectState<FirewallWithSequence>;

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
      acc[eachFirewall.id] = {
        ...eachFirewall,
        rules: eachFirewall.rules.map(eachRule => ({
          /**
           * map over each inbound and outbound rule and add the original order to them.
           * This is important because the API's original ordering matters
           * and the order they are returned in is the order they are applied.
           */
          inbound: (eachRule.inbound || []).map((eachInboundRule, index) => ({
            ...eachInboundRule,
            sequence: index + 1
          })),
          outbound: (eachRule.outbound || []).map(
            (eachOutboundRule, index) => ({
              ...eachOutboundRule,
              sequence: index + 1
            })
          )
        }))
      };
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
