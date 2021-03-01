import { databaseTypeFactory } from 'src/factories/databases';
import { getDatabaseTypesActions } from './types.actions';
import reducer, { defaultState } from './types.reducer';

describe('Database types reducer', () => {
  it('should handle a get.start action correctly', () => {
    const newState = reducer(defaultState, getDatabaseTypesActions.started({}));
    expect(newState.loading).toBe(true);
    expect(newState.lastUpdated).toEqual(0), expect(newState.error).toEqual({});
  });

  it('should handle a get.done action correctly', () => {
    const mockTypes = databaseTypeFactory.buildList(10);
    const newState = reducer(
      defaultState,
      getDatabaseTypesActions.done({
        params: {},
        result: {
          data: mockTypes,
          results: mockTypes.length,
        },
      })
    );
    expect(newState.loading).toBe(false);
    expect(newState.lastUpdated).toBeGreaterThan(0);
    expect(newState.data).toEqual(mockTypes);
  });

  it('should handle a get.failed action correctly', () => {
    const mockError = [{ reason: 'An error' }];
    const newState = reducer(
      defaultState,
      getDatabaseTypesActions.failed({ error: mockError, params: {} })
    );
    expect(newState.loading).toBe(false);
    expect(newState.error.read).toEqual(mockError);
    expect(newState.lastUpdated).toEqual(0);
  });
});
