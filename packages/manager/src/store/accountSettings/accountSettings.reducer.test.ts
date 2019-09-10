import { accountSettings } from 'src/__data__/account';
import {
  requestAccountSettingsActions,
  updateAccountSettingsActions,
  updateSettingsInStore
} from './accountSettings.actions';
import reducer, { defaultState } from './accountSettings.reducer';

const error = [{ reason: 'An error occurred.' }];
const updatedSettings = { backups_enabled: false, ...accountSettings };

describe('Redux for Account settings', () => {
  it('should handle an initialization action', () => {
    const newState = reducer(
      defaultState,
      requestAccountSettingsActions.started
    );
    expect(newState).toHaveProperty('loading', true);
  });

  it('should handle a failed request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      requestAccountSettingsActions.failed({ error })
    );
    expect(newState).toHaveProperty('loading', false);
    expect(newState.error).toHaveProperty('read', error);
  });

  it('should handle a successful request', () => {
    const newState = reducer(
      { ...defaultState, loading: true },
      requestAccountSettingsActions.done({ result: accountSettings })
    );
    expect(newState).toHaveProperty('data', accountSettings);
    expect(newState).toHaveProperty('loading', false);
  });

  it('should initiate an updater request', () => {
    const newState = reducer(
      { ...defaultState, error: { update: error } },
      updateAccountSettingsActions.started
    );
    expect(newState.error).toHaveProperty('update', undefined);
  });

  it('should handle an update request', () => {
    const newState = reducer(
      { ...defaultState, data: accountSettings },
      updateAccountSettingsActions.done({ result: accountSettings, params: {} })
    );
    expect(newState).toHaveProperty('data', updatedSettings);
    expect(newState).toHaveProperty('loading', false);
  });

  it('should handle a failed update', () => {
    const newState = reducer(
      { ...defaultState, data: accountSettings },
      updateAccountSettingsActions.failed({ error, params: {} })
    );
    expect(newState).toHaveProperty('data', accountSettings);
    expect(newState.error).toHaveProperty('update', error);
  });

  it('should update settings in store', () => {
    const newState = reducer(
      { ...defaultState, data: accountSettings },
      updateSettingsInStore({ managed: !accountSettings.managed })
    );
    expect(newState.data).toHaveProperty('managed', !accountSettings.managed);
  });
});
