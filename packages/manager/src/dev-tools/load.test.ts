import { isDevToolEnabled } from './load';

describe('isDevToolsEnabled', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  it('it defaults to FALSE in production builds, but can be enabled', () => {
    process.env.NODE_ENV = 'production';
    expect(isDevToolEnabled()).toBe(false);

    window.localStorage.setItem('dev-tools', 'true');
    expect(isDevToolEnabled()).toBe(true);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=true');
    expect(isDevToolEnabled()).toBe(true);
  });

  it('it defaults to TRUE in development mode, but can be disabled', () => {
    process.env.NODE_ENV = 'development';
    expect(isDevToolEnabled()).toBe(true);

    window.localStorage.setItem('dev-tools', 'false');
    expect(isDevToolEnabled()).toBe(false);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=false');
    expect(isDevToolEnabled()).toBe(false);
  });
});
