import { regions } from 'src/__data__/regionsData';
import { regionsRequestActions } from './regions.actions';
import reducer, { defaultState } from './regions.reducer';

const mockError = [{ reason: 'No reason' }];

describe('Regions reducer', () => {
  it('should handle an initialized request correctly', () => {
    const newState = reducer(defaultState, regionsRequestActions.started);
    expect(newState.loading).toBe(true);
  });

  it('should handle a successful request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      regionsRequestActions.done({ result: regions })
    );
    expect(newState.entities).toEqual(regions);
    expect(newState.results).toHaveLength(regions.length);
    expect(newState.loading).toBe(false);
  });

  it('should handle a failed request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      regionsRequestActions.failed({ error: mockError })
    );
    expect(newState.loading).toBe(false);
    expect(newState.error).toEqual(mockError);
  });
});
