import { getEnvLocalStorageOverrides, isDevToolsEnvValid } from './storage';

describe('getLocalStorageOverrides', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  const localStorageData = {
    apiRoot: 'http://localhost:5000/v4',
    clientID: 'MY_CLIENT_ID',
    label: 'My Env',
    loginRoot: 'http://login.localhost:5000',
  };

  describe('built for development mode', () => {
    // Stub `DEV` environment variable to be truthy.
    beforeEach(() => {
      vi.stubEnv('DEV', '1');
    });

    it('returns overrides if overrides are defined', () => {
      window.localStorage.setItem(
        'devTools/env',
        JSON.stringify(localStorageData)
      );
      const overrides = getEnvLocalStorageOverrides();
      expect(overrides).toBeDefined();
      expect(overrides?.apiRoot).toBe(localStorageData.apiRoot);
      expect(overrides?.loginRoot).toBe(localStorageData.loginRoot);
      expect(overrides?.clientID).toBe(localStorageData.clientID);
    });

    it('returns `undefined` if no overrides are defined', () => {
      const overrides = getEnvLocalStorageOverrides();
      expect(overrides).toBeDefined();
      expect(overrides?.apiRoot).toBe(localStorageData.apiRoot);
      expect(overrides?.loginRoot).toBe(localStorageData.loginRoot);
      expect(overrides?.clientID).toBe(localStorageData.clientID);
    });
  });

  describe('not built for development mode', () => {
    // Stub `DEV` environment variable to be falsy.
    beforeEach(() => {
      vi.stubEnv('DEV', '');
    });

    it('returns `undefined` when overrides are defined', () => {
      window.localStorage.setItem(
        'devTools/env',
        JSON.stringify(localStorageData)
      );
      const overrides = getEnvLocalStorageOverrides();
      expect(overrides).toBeUndefined();
    });
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
