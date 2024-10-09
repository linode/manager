import { getIsPrivateIP } from './ipUtils';

describe('getIsPrivateIP', () => {
  it('returns true for a private IPv4', () => {
    expect(getIsPrivateIP('192.168.1.1')).toBe(true);
    expect(getIsPrivateIP('172.16.5.12')).toBe(true);
  });

  it('returns false for a public IPv4', () => {
    expect(getIsPrivateIP('45.79.245.236')).toBe(false);
    expect(getIsPrivateIP('100.78.0.8')).toBe(false);
  });
});
