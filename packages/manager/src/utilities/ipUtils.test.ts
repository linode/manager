import { isPrivateIP } from './ipUtils';

describe('isPrivateIP', () => {
  it('returns true for a private IPv4', () => {
    expect(isPrivateIP('192.168.1.1')).toBe(true);
    expect(isPrivateIP('172.16.5.12')).toBe(true);
  });

  it('returns false for a public IPv4', () => {
    expect(isPrivateIP('45.79.245.236')).toBe(false);
    expect(isPrivateIP('100.78.0.8')).toBe(false);
  });
});
