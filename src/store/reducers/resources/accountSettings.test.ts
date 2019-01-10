import account, * as A from './accountSettings';

import { accountSettings } from 'src/__data__/account';
import { mockAPIFieldErrors } from 'src/services';

const error = mockAPIFieldErrors([]);
const updatedSettings = {backups_enabled: false, ...accountSettings};

describe("Redux duck for Account settings", () => {
  it("should handle LOAD", () => {
    const newState = account(A.defaultState, A.startRequest());
    expect(newState).toHaveProperty('loading', true);
  });
  it("should handle ERROR", () => {
    const newState = account(
      { ...A.defaultState, loading: true },
      A.handleError(error)
    );
    expect(newState).toHaveProperty('loading', false);
    expect(newState).toHaveProperty('error', error);
  });
  it("should handle SUCCESS", () => {
    const newState = account(
      { ...A.defaultState, loading: true, error, updateError: error },
      A.handleSuccess(accountSettings)
    );
    expect(newState).toHaveProperty('data', accountSettings);
    expect(newState).toHaveProperty('error', undefined);
    expect(newState).toHaveProperty('updateError', undefined);
    expect(newState).toHaveProperty('loading', false);
  });
  it("should handle UPDATE", () => {
    const newState = account(
      { ...A.defaultState, data: accountSettings, error, updateError: error },
      A.handleUpdate(accountSettings)
    );
    expect(newState).toHaveProperty('data', updatedSettings);
    expect(newState).toHaveProperty('error', undefined);
    expect(newState).toHaveProperty('updateError', undefined);
    expect(newState).toHaveProperty('loading', false);
  });
  it("should handle UPDATE_ERROR", () => {
    const newState = account(
      {...A.defaultState, data: accountSettings, updateError: undefined },
      A.handleUpdateError(error)
    );
    expect(newState).toHaveProperty('data', accountSettings);
    expect(newState).toHaveProperty('error', undefined);
    expect(newState).toHaveProperty('updateError', error);
  });
});
