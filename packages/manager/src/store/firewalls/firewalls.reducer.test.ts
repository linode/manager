import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { getFirewalls } from './firewalls.actions';
import reducer, { defaultState } from './firewalls.reducer';

const mockError = [{ reason: 'no reason' }];

const baseFirewall: Firewall[] = [
  {
    id: 1,
    rules: {
      inbound: [],
      outbound: [
        {
          protocol: 'ALL',
          start_port: 443
        },
        {
          protocol: 'ALL',
          start_port: 80
        }
      ]
    },
    status: 'disabled',
    label: 'zzz',
    created_dt: '2019-12-11T19:44:38.526Z',
    updated_dt: '2019-12-11T19:44:38.526Z',
    tags: [],
    devices: {}
  }
];

describe('Cloud Firewalls Reducer', () => {
  it('should handle an initiated request for services', () => {
    expect(reducer(defaultState, getFirewalls.started())).toHaveProperty(
      'loading',
      true
    );
  });

  it('should handle a failed GET request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      getFirewalls.failed({ error: mockError })
    );

    expect(newState).toHaveProperty('error', { read: mockError });
    expect(newState).toHaveProperty('loading', false);
  });

  it('should handle a successful GET request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      getFirewalls.done({ result: { data: baseFirewall, results: 2 } })
    );
    expect(newState).toHaveProperty('data', {
      1: {
        id: 1,
        rules: {
          inbound: [],
          outbound: [
            {
              protocol: 'ALL',
              start_port: 443,
              sequence: 1
            },
            {
              protocol: 'ALL',
              start_port: 80,
              sequence: 2
            }
          ]
        },
        status: 'disabled',
        label: 'zzz',
        created_dt: '2019-12-11T19:44:38.526Z',
        updated_dt: '2019-12-11T19:44:38.526Z',
        tags: [],
        devices: {}
      }
    });
    expect(newState).toHaveProperty('loading', false);
    expect(newState.error!.read).toBeUndefined();
    expect(newState.results).toBe(2);
  });
});
