import { getEnvLocalStorageOverrides } from './storage';

describe('getLocalStorageOverrides', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  const localStorage = {
    apiRoot: 'http://localhost:5000/v4',
    loginRoot: 'http://login.localhost:5000',
    clientID: 'MY_CLIENT_ID'
  };

  it('it returns overrides if defined and if dev tools are enabled', () => {
    // Development mode
    process.env.NODE_ENV = 'development';

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
    // Production build
    process.env.NODE_ENV = 'production';

    // Enable the dev tools.
    window.localStorage.setItem('dev-tools', 'true');

    // Set the overrides in local storage.
    window.localStorage.setItem('devTools/env', JSON.stringify(localStorage));

    // No overrides should be returned.
    expect(getEnvLocalStorageOverrides()).toBeUndefined();
  });
});
