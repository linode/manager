import { firewallFactory, firewallRulesFactory } from 'src/factories/firewalls';
import {
  createFirewallActions,
  deleteFirewallActions,
  getFirewalls,
  // updateFirewallActions
} from './firewalls.actions';
import reducer, { defaultState } from './firewalls.reducer';

const mockError = [{ reason: 'no reason' }];

const baseFirewall = firewallFactory.buildList(3);

const addEntities = () =>
  reducer(
    defaultState,
    getFirewalls.done({
      params: {},
      result: { data: baseFirewall, results: 3 },
    })
  );

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
        result: { data: baseFirewall, results: 3 },
      })
    );
    expect(Object.values(newState.itemsById)).toEqual(baseFirewall);
    expect(newState).toHaveProperty('loading', false);
    expect(newState.error!.read).toBeUndefined();
    expect(newState.results).toBe(3);
  });

  it('should handle a successful GET with an empty response', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      getFirewalls.done({
        params: {},
        result: { data: [], results: 0 },
      })
    );
    expect(newState.itemsById).toEqual({});
    expect(newState).toHaveProperty('loading', false);
    expect(newState.error!.read).toBeUndefined();
    expect(newState.results).toBe(0);
  });

  it('should handle a successful Create action', () => {
    const params = {
      rules: firewallRulesFactory.build(),
    };
    const newFirewall = firewallFactory.build();
    const newState = reducer(
      defaultState,
      createFirewallActions.done({ params, result: newFirewall })
    );

    expect(newState.error.create).toBeUndefined();
    expect(newState.itemsById).toHaveProperty(
      String(newFirewall.id),
      newFirewall
    );
  });

  it('should handle a failed Create action', () => {
    const params = {
      rules: firewallRulesFactory.build(),
    };
    const newState = reducer(
      defaultState,
      createFirewallActions.failed({ params, error: mockError })
    );
    expect(newState.error).toHaveProperty('create', mockError);
  });

  it('delete.started should clear the error state for deletion', () => {
    const newState = reducer(
      { ...defaultState, error: { delete: mockError } },
      deleteFirewallActions.started({ firewallID: 1 })
    );
    expect(newState.error).toHaveProperty('delete', undefined);
  });

  it('should handle a successful deletion', () => {
    const stateWithFirewalls = addEntities();
    const firewallToDelete = stateWithFirewalls.itemsById[baseFirewall[1].id];
    const newState = reducer(
      stateWithFirewalls,
      deleteFirewallActions.done({
        params: { firewallID: firewallToDelete.id },
        result: {},
      })
    );
    expect(newState.results).toBe(stateWithFirewalls.results - 1);
    expect(newState.results).not.toHaveProperty(String(firewallToDelete.id));
  });

  it('should handle a failed deletion', () => {
    const stateWithFirewalls = addEntities();
    const firewallIDToDelete = baseFirewall[1].id;
    const newState = reducer(
      stateWithFirewalls,
      deleteFirewallActions.failed({
        params: { firewallID: firewallIDToDelete },
        error: mockError,
      })
    );
    expect(newState.results).toBe(stateWithFirewalls.results);
    expect(newState.itemsById).toHaveProperty(String(firewallIDToDelete));
    expect(newState.lastUpdated).toBe(stateWithFirewalls.lastUpdated);
    expect(newState.error).toHaveProperty('delete', mockError);
  });
});
