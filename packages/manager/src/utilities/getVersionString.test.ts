describe('Append Cloud Manager Version', () => {
  // Since we'll be changing ENV variables between tests, setup & teardown is required.
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('returns the version as set by .env', () => {
    process.env.VERSION = '0.00.0';
    // We're requiring a fresh module each time so that the module picks up
    // ENV variable changes.
    const versionString = require('./getVersionString').getVersionString();
    expect(versionString.includes('0.00.0')).toBeTruthy();
  });

  it('prefixes the version with "Cloud Manager Version: "', () => {
    process.env.VERSION = '0.00.0';
    const versionString = require('./getVersionString').getVersionString();
    expect(
      versionString.startsWith('<span class="version">Cloud Manager Version: ')
    ).toBeTruthy();
  });

  it('returns the prefix concatenated with the version', () => {
    process.env.VERSION = '0.00.0';
    const versionString = require('./getVersionString').getVersionString();
    expect(versionString).toBe(
      '<span class="version">Cloud Manager Version: 0.00.0</span>'
    );
  });

  it('returns an empty string if the version env variable cannot be found', () => {
    process.env.VERSION = undefined;
    const versionString = require('./getVersionString').getVersionString();
    expect(versionString).toBe('');
  });
});
