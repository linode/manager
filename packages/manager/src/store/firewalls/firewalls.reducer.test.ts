import { firewallFactory, firewallRulesFactory } from 'src/factories/firewalls';
import { createFirewallActions, getFirewalls } from './firewalls.actions';
import reducer, { defaultState } from './firewalls.reducer';

const mockError = [{ reason: 'no reason' }];

<<<<<<< HEAD
const baseFirewall: Firewall[] = [
  {
    id: 1,
    rules: {
      inbound: [],
      outbound: [
        {
          protocol: 'ALL',
          ports: '443'
        },
        {
          protocol: 'ALL',
          ports: '80'
        }
      ]
    },
    status: 'disabled',
    label: 'zzz',
    created_dt: '2019-12-11T19:44:38.526Z',
    updated_dt: '2019-12-11T19:44:38.526Z',
    tags: []
  }
];
=======
const baseFirewall = firewallFactory.buildList(1);
>>>>>>> Add partial factories and tests

describe('Cloud Firewalls Reducer', () => {
  it('should handle an initiated request for services', () => {
    expect(
      reducer(defaultState, getFirewalls.started({ params: {} }))
    ).toHaveProperty('loading', true);
  });

  it('should handle a failed GET request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      getFirewalls.failed({ params: {}, error: mockError })
    );

    expect(newState).toHaveProperty('error', { read: mockError });
    expect(newState).toHaveProperty('loading', false);
  });

  it('should handle a successful GET request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      getFirewalls.done({
        params: {},
        result: { data: baseFirewall, results: 2 }
      })
    );
    expect(newState).toHaveProperty('data', baseFirewall);
    expect(newState).toHaveProperty('loading', false);
    expect(newState.error!.read).toBeUndefined();
    expect(newState.results).toBe(2);
  });

  it('should handle a successful Create action', () => {
    const params = {
      rules: firewallRulesFactory.build()
    };
    const newFirewall = firewallFactory.build();
    const newState = reducer(
      defaultState,
      createFirewallActions.done({ params, result: newFirewall })
    );

    expect(newState.error.create).toBeUndefined();
    expect(newState.data).toHaveLength(1);
  });
});
