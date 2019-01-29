process.env.VERSION = '0.00.0';
import { getVersionString } from './getVersionString';

describe('Append Cloud Manager Version', () => {
  const versionString = getVersionString();

  it('returns the version as set by .env', () => {
    expect(versionString.includes('0.00.0')).toBeTruthy();
  });

  it('prefixes the version with "Cloud Manager Version: "', () => {
    expect(versionString.startsWith('Cloud Manager Version: ')).toBeTruthy();
  });

  it('returns the prefix concatenated with the version', () => {
    expect(versionString).toBe('Cloud Manager Version: 0.00.0');
  });
});
