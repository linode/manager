import { monitors } from 'src/__data__/serviceMonitors';

import { requestServicesActions } from './managed.actions';
import reducer, { defaultState } from './managed.reducer';

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
    const mockError = [{ reason: 'no reason' }];
    const newState = reducer(
      { ...defaultState, loading: true },
      requestServicesActions.failed({ error: mockError })
    );
    expect(newState.error!.read).toEqual(mockError);
    expect(newState).toHaveProperty('loading', false);
  });
});
