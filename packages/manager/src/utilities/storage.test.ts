import { getEnvLocalStorageOverrides, isDevToolsEnvValid } from './storage';

describe('getLocalStorageOverrides', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const localStorage = {
    apiRoot: 'http://localhost:5000/v4',
    clientID: 'MY_CLIENT_ID',
    label: 'My Env',
    loginRoot: 'http://login.localhost:5000',
  };

  it.skip('it returns overrides if defined and if dev tools are enabled', () => {
    // Enable the dev tools.
    window.localStorage.setItem('dev-tools', 'true');

    // Set the overrides in local storage.
    window.localStorage.setItem('devTools/env', JSON.stringify(localStorage));

    const overrides = getEnvLocalStorageOverrides();
    expect(overrides).toBeDefined();
    expect(overrides?.apiRoot).toBe(localStorage.apiRoot);
    expect(overrides?.loginRoot).toBe(localStorage.loginRoot);
    expect(overrides?.clientID).toBe(localStorage.clientID);

    // Disable the dev tools.
    window.localStorage.setItem('dev-tools', 'false');

    // Now, no overrides should be returned.
    expect(getEnvLocalStorageOverrides()).toBeUndefined();
  });

  it('only returns overrides while in development mode', () => {
    // Enable the dev tools.
    window.localStorage.setItem('dev-tools', 'true');

    // Set the overrides in local storage.
    window.localStorage.setItem('devTools/env', JSON.stringify(localStorage));

    // No overrides should be returned.
    expect(getEnvLocalStorageOverrides()).toBeUndefined();
  });
});

describe('isDevToolsEnvValid', () => {
  it('returns `true` if all properties are strings', () => {
    expect(
      isDevToolsEnvValid({
        apiRoot: 'string-a',
        clientID: 'string-c',
        label: 'string-d',
        loginRoot: 'string-b',
      })
    ).toBe(true);
    expect(
      isDevToolsEnvValid({
        apiRoot: {},
        clientID: 'string-c',
        label: 'string-d',
        loginRoot: 'string-b',
      })
    ).toBe(false);
  });
  it('works with mangled input', () => {
    expect(isDevToolsEnvValid(true as any)).toBe(false);
    expect(isDevToolsEnvValid('hello' as any)).toBe(false);
    expect(isDevToolsEnvValid(null as any)).toBe(false);
    expect(isDevToolsEnvValid(undefined as any)).toBe(false);
  });
});
