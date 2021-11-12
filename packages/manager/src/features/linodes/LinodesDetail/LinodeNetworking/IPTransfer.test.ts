import { getLinodeIPv6Ranges } from './IPTransfer';

describe('getLinodeIPv6Ranges', () => {
  const ipv6Ranges = [
    {
      range: '2fff:db08:e003:1::',
      prefix: 64,
      region: 'us-east',
      route_target: '2600:3c03::f03c:92ff:fe8d:5c0c',
    },
    {
      range: '2fff:db08:e003:2::',
      prefix: 64,
      region: 'us-east',
      route_target: '2600:3c03::f03c:92ff:fe8d:5c0d',
    },
    {
      range: '2fff:db08:e003:3::',
      prefix: 56,
      region: 'us-east',
      route_target: '2600:3c03::f03c:92ff:fe8d:5c0d',
    },
  ];

  it('returns an array of ranges', () => {
    expect(
      getLinodeIPv6Ranges(ipv6Ranges, '2600:3c03::f03c:92ff:fe8d:5c0d/128')
    ).toEqual(['2fff:db08:e003:2::/64', '2fff:db08:e003:3::/56']);
  });

  it('returns an empty array if at least one argument is undefined or null', () => {
    expect(
      getLinodeIPv6Ranges(undefined, '2600:3c03::f03c:92ff:fe8d:5b1b/128')
    ).toEqual([]);
    expect(getLinodeIPv6Ranges(ipv6Ranges, null)).toEqual([]);
    expect(getLinodeIPv6Ranges(undefined, null)).toEqual([]);
  });
});
