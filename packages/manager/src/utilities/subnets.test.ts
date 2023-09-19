import { calculateAvailableIPv4s } from './subnets';

describe('calculateAvailableIPv4s', () => {
  it('should return a number if the input is a valid IPv4 with a mask', () => {
    const availIP24 = calculateAvailableIPv4s('10.0.0.0/24');
    expect(availIP24).toBe(256);
    const availIP32 = calculateAvailableIPv4s('10.0.0.0/32');
    expect(availIP32).toBe(1);
  });

  it('should return undefined if the input is a valid IPv4 without a mask', () => {
    const noMask = calculateAvailableIPv4s('10.0.0.0');
    expect(noMask).toBe(undefined);
  });

  it('should return undefined if the input is not IPv4', () => {
    const badIP = calculateAvailableIPv4s('bad ip');
    expect(badIP).toBe(undefined);

    const ipv6 = calculateAvailableIPv4s(
      '98d7:1707:3b5c:55b5:9481:f856:fd14:0eb4'
    );
    expect(ipv6).toBe(undefined);

    const badMask = calculateAvailableIPv4s('10.0.0.0/bad mask');
    expect(badMask).toBe(undefined);
    const badMask2 = calculateAvailableIPv4s('10.0.0.0/100');
    expect(badMask2).toBe(undefined);
  });
});
