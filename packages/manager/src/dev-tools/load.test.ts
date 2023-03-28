import { vi } from 'vitest';
import { devToolsEnabled } from './load';

const stubEnvironment = (environment: 'production' | 'development') => {
  vi.stubEnv('NODE_ENV', environment);
  vi.stubEnv('MODE', environment);
  vi.stubEnv('DEV', environment === 'production' ? '' : '1');
};

describe('devToolsEnabled', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    window.localStorage.clear();
    window.history.replaceState({}, 'Dev Tools Test', '/');
  });

  it('it defaults to FALSE in production builds', () => {
    stubEnvironment('production');
    expect(devToolsEnabled()).toBe(false);
  });

  it('it defaults to TRUE in development mode', () => {
    stubEnvironment('development');
    expect(devToolsEnabled()).toBe(true);
  });

  it('can be enabled with local storage key/value pair', () => {
    stubEnvironment('production');
    window.localStorage.setItem('dev-tools', 'true');
    expect(devToolsEnabled()).toBe(true);
  });

  it('can be disabled with local storage key/value pair', () => {
    stubEnvironment('development');
    window.localStorage.setItem('dev-tools', 'false');
    expect(devToolsEnabled()).toBe(false);
  });

  it('can be enabled with `dev-tools` query param', () => {
    stubEnvironment('production');
    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=true');
    expect(devToolsEnabled()).toBe(true);
  });

  it('can be disabled with `dev-tools` query param', () => {
    stubEnvironment('development');
    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=false');
    expect(devToolsEnabled()).toBe(false);
  });
});
