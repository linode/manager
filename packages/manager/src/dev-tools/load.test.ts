import { getShouldEnableDevTools } from './load';

describe('getShouldEnableDevTools', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('it defaults to FALSE in production builds, but can be enabled', () => {
    expect(getShouldEnableDevTools()).toBe(false);

    window.localStorage.setItem('dev-tools', 'true');
    expect(getShouldEnableDevTools()).toBe(true);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=true');
    expect(getShouldEnableDevTools()).toBe(true);
  });

  it('it defaults to TRUE in development mode, but can be disabled', () => {
    expect(getShouldEnableDevTools()).toBe(true);

    window.localStorage.setItem('dev-tools', 'false');
    expect(getShouldEnableDevTools()).toBe(false);

    window.localStorage.clear();

    window.history.pushState({}, 'Dev Tools Test', '/?dev-tools=false');
    expect(getShouldEnableDevTools()).toBe(false);
  });
});
