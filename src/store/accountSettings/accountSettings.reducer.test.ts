import { accountSettings } from 'src/__data__/account';
import {
  handleError,
  handleSuccess,
  handleUpdate,
  handleUpdateError,
  startRequest
} from './accountSettings.actions';
import reducer, { defaultState } from './accountSettings.reducer';

const error = Error();
const updatedSettings = { backups_enabled: false, ...accountSettings };

describe('Redux duck for Account settings', () => {
  it('should handle LOAD', () => {
    const newState = reducer(defaultState, startRequest());
    expect(newState).toHaveProperty('loading', true);
  });
  it('should handle ERROR', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      handleError(error)
    );
    expect(newState).toHaveProperty('loading', false);
    expect(newState).toHaveProperty('error', error);
  });
  it('should handle SUCCESS', () => {
    const newState = reducer(
      { ...defaultState, loading: true, error, updateError: error },
      handleSuccess(accountSettings)
    );
    expect(newState).toHaveProperty('data', accountSettings);
    expect(newState).toHaveProperty('error', undefined);
    expect(newState).toHaveProperty('updateError', undefined);
    expect(newState).toHaveProperty('loading', false);
  });
  it('should handle UPDATE', () => {
    const newState = reducer(
      { ...defaultState, data: accountSettings, error, updateError: error },
      handleUpdate(accountSettings)
    );
    expect(newState).toHaveProperty('data', updatedSettings);
    expect(newState).toHaveProperty('error', undefined);
    expect(newState).toHaveProperty('updateError', undefined);
    expect(newState).toHaveProperty('loading', false);
  });
  it('should handle UPDATE_ERROR', () => {
    const newState = reducer(
      { ...defaultState, data: accountSettings, updateError: undefined },
      handleUpdateError(error)
    );
    expect(newState).toHaveProperty('data', accountSettings);
    expect(newState).toHaveProperty('error', undefined);
    expect(newState).toHaveProperty('updateError', error);
  });
});
