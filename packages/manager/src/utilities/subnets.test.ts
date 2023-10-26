import { calculateAvailableIPv4sRFC1918 } from './subnets';

describe('calculateAvailableIPv4s', () => {
  it('should return a number if the input is a valid RFC1918 IPv4 with a mask', () => {
    // 10.x ips
    const availIP1024 = calculateAvailableIPv4sRFC1918('10.0.0.0/24');
    expect(availIP1024).toBe(256);
    const availIP1032 = calculateAvailableIPv4sRFC1918('10.255.255.255/32');
    expect(availIP1032).toBe(1);
    const availIP109 = calculateAvailableIPv4sRFC1918('10.5.16.20/9');
    expect(availIP109).toBe(8388608);

    // 172.16-31.x ips
    const availIP17212 = calculateAvailableIPv4sRFC1918('172.16.0.0/12');
    expect(availIP17212).toBe(1048576);
    const availIP17232 = calculateAvailableIPv4sRFC1918('172.31.255.255/32');
    expect(availIP17232).toBe(1);
    const availIP1722032 = calculateAvailableIPv4sRFC1918('172.20.16.20/12');
    expect(availIP1722032).toBe(1048576);

    // 192.168
    const availIP19216 = calculateAvailableIPv4sRFC1918('192.168.24.36/16');
    expect(availIP19216).toBe(65536);
    const availIP19224 = calculateAvailableIPv4sRFC1918('192.168.24.36/24');
    expect(availIP19224).toBe(256);
  });

  it('should return undefined for valid, non RFC1918 ips', () => {
    //10.x ips
    const badIP10 = calculateAvailableIPv4sRFC1918('10.0.0.0/7');
    expect(badIP10).toBeUndefined();

    //172.x ips
    const badIP17215 = calculateAvailableIPv4sRFC1918('172.15.0.0/24');
    expect(badIP17215).toBeUndefined();
    const badIP17232 = calculateAvailableIPv4sRFC1918('172.32.0.0/24');
    expect(badIP17232).toBeUndefined();
    const badIP172Mask = calculateAvailableIPv4sRFC1918('172.16.0.0/11');
    expect(badIP172Mask).toBeUndefined();

    //192.x ips
    const badIPNot192168 = calculateAvailableIPv4sRFC1918('192.15.0.0/24');
    expect(badIPNot192168).toBeUndefined();
    const badIP192mask = calculateAvailableIPv4sRFC1918('192.168.0.0/15');
    expect(badIP192mask).toBeUndefined();

    //non 10x, 172x, or 168x ips:
    const nonRFC1 = calculateAvailableIPv4sRFC1918('145.24.8.0/24');
    expect(nonRFC1).toBeUndefined();
    const nonRFC2 = calculateAvailableIPv4sRFC1918('247.9.82.128/16');
    expect(nonRFC2).toBeUndefined();
  });

  it('should return undefined if the input is a valid IPv4 without a mask', () => {
    const noMask = calculateAvailableIPv4sRFC1918('10.0.0.0');
    expect(noMask).toBe(undefined);
  });

  it('should return undefined if the input is not IPv4', () => {
    const badIP = calculateAvailableIPv4sRFC1918('bad ip');
    expect(badIP).toBe(undefined);

    const ipv6 = calculateAvailableIPv4sRFC1918(
      '98d7:1707:3b5c:55b5:9481:f856:fd14:0eb4'
    );
    expect(ipv6).toBe(undefined);

    const badMask = calculateAvailableIPv4sRFC1918('10.0.0.0/bad mask');
    expect(badMask).toBe(undefined);
    const badMask2 = calculateAvailableIPv4sRFC1918('10.0.0.0/100');
    expect(badMask2).toBe(undefined);
    const badMask3 = calculateAvailableIPv4sRFC1918('10.0.0.0/-100');
    expect(badMask3).toBe(undefined);
  });
});
