import { getIPv6DNSResolvers, ipv6DNSResolverPrefixes } from './resolvers';

describe('getIPv6DNSResolvers', () => {
  it('should return all 7 IPv6 DNS Resolvers for the given region', () => {
    expect(getIPv6DNSResolvers('atlanta')).toHaveLength(7);
  });

  it('should begin all resolvers with the prefix for the given region', () => {
    const resolvers = getIPv6DNSResolvers('atlanta');
    resolvers.forEach(resolver => {
      expect(resolver.startsWith(ipv6DNSResolverPrefixes.atlanta)).toBe(true);
    });
  });

  it('should return ::5-9, ::b, and ::c', () => {
    const resolvers = getIPv6DNSResolvers('atlanta');
    const hasElementThatEndsWith = (toMatch: string) =>
      resolvers.filter(resolver => resolver.endsWith(toMatch)).length > 0;

    expect(hasElementThatEndsWith('5')).toBe(true);
    expect(hasElementThatEndsWith('6')).toBe(true);
    expect(hasElementThatEndsWith('7')).toBe(true);
    expect(hasElementThatEndsWith('8')).toBe(true);
    expect(hasElementThatEndsWith('9')).toBe(true);
    expect(hasElementThatEndsWith('b')).toBe(true);
    expect(hasElementThatEndsWith('c')).toBe(true);
  });
});
