import {
  ManagedServiceMonitor,
  MonitorStatus
} from 'linode-js-sdk/lib/managed';
import { monitors } from 'src/__data__/serviceMonitors';

import {
  deleteServiceMonitorActions,
  disableServiceMonitorActions,
  enableServiceMonitorActions,
  requestServicesActions
} from './managed.actions';
import reducer, { defaultState } from './managed.reducer';

const mockError = [{ reason: 'no reason' }];

const addEntities = (entities: ManagedServiceMonitor[]) =>
  reducer(defaultState, requestServicesActions.done({ result: entities }));

describe('Managed services reducer', () => {
  it('should handle an initiated request for services', () => {
    expect(
      reducer(defaultState, requestServicesActions.started())
    ).toHaveProperty('loading', true);
  });

  it('should handle a successful services request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      requestServicesActions.done({ result: monitors })
    );
    expect(newState).toHaveProperty('entities', monitors);
    expect(newState).toHaveProperty('loading', false);
    expect(newState.error!.read).toBeUndefined();
    expect(newState.results).toHaveLength(monitors.length);
  });

  it('should handle a failed services request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      requestServicesActions.failed({ error: mockError })
    );
    expect(newState.error!.read).toEqual(mockError);
    expect(newState).toHaveProperty('loading', false);
  });

  it('should handle a disable action', () => {
    const disabledMonitor = {
      ...monitors[0],
      status: 'disabled' as MonitorStatus
    };
    const withEntities = addEntities(monitors);
    const newState = reducer(
      withEntities,
      disableServiceMonitorActions.done({
        params: { monitorID: monitors[0].id },
        result: disabledMonitor
      })
    );
    expect(newState.entities[0]).toEqual(disabledMonitor);
    expect(newState.results.length).toBe(withEntities.results.length);
    expect(newState.entities).not.toContain(monitors[0]);
  });

  it('should handle a failed disabled action', () => {
    const newState = reducer(
      defaultState,
      disableServiceMonitorActions.failed({
        params: { monitorID: 12345 },
        error: mockError
      })
    );
    expect(newState.error).toHaveProperty('update', mockError);
  });

  it('should handle a delete action successfully', () => {
    const withEntities = addEntities(monitors);
    const deletedState = reducer(
      withEntities,
      deleteServiceMonitorActions.done({
        params: { monitorID: monitors[0].id },
        result: {}
      })
    );
    expect(deletedState.results).toHaveLength(monitors.length - 1);
  });

  it('should handle a failed delete action', () => {
    const withEntities = addEntities(monitors);
    const newState = reducer(
      withEntities,
      deleteServiceMonitorActions.failed({
        error: mockError,
        params: { monitorID: 12345 }
      })
    );
    expect(newState.error!.delete).toEqual(mockError);
  });

  it('should handle an enable action', () => {
    const withEntities = addEntities([{ ...monitors[0], status: 'disabled' }]);
    const enabledState = reducer(
      withEntities,
      enableServiceMonitorActions.done({
        params: { monitorID: monitors[0].id },
        result: monitors[0]
      })
    );
    expect(enabledState.entities[0]).toHaveProperty('status', 'pending');
  });

  it('should handle a failed enable action', () => {
    const newState = reducer(
      defaultState,
      enableServiceMonitorActions.failed({
        error: mockError,
        params: { monitorID: 12345 }
      })
    );
    expect(newState.error!.update).toEqual(mockError);
  });
});
