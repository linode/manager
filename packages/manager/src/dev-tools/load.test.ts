import { devToolsEnabled } from './load';

describe('devToolsEnabled', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('it defaults to FALSE in production builds, but can be enabled', () => {
    expect(devToolsEnabled()).toBe(false);

    window.localStorage.setItem('dev-tools', 'true');
    expect(devToolsEnabled()).toBe(true);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=true');
    expect(devToolsEnabled()).toBe(true);
  });

  it('it defaults to TRUE in development mode, but can be disabled', () => {
    expect(devToolsEnabled()).toBe(true);

    window.localStorage.setItem('dev-tools', 'false');
    expect(devToolsEnabled()).toBe(false);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=false');
    expect(devToolsEnabled()).toBe(false);
  });
});
