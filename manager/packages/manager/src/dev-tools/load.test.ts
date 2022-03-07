import { devToolsEnabled } from './load';

describe('devToolsEnabled', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  it('it defaults to FALSE in production builds, but can be enabled', () => {
    process.env.NODE_ENV = 'production';
    expect(devToolsEnabled()).toBe(false);

    window.localStorage.setItem('dev-tools', 'true');
    expect(devToolsEnabled()).toBe(true);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=true');
    expect(devToolsEnabled()).toBe(true);
  });

  it('it defaults to TRUE in development mode, but can be disabled', () => {
    process.env.NODE_ENV = 'development';
    expect(devToolsEnabled()).toBe(true);

    window.localStorage.setItem('dev-tools', 'false');
    expect(devToolsEnabled()).toBe(false);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=false');
    expect(devToolsEnabled()).toBe(false);
  });
});
