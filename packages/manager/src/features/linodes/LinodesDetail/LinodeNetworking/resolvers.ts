// @todo: In principle, everything in this file should be returned by the API.
// We have no choice but to hard-code these at the moment.

export const ipv4DNSResolvers: Record<Linode.ZoneName, string[]> = {
  newark: [
    '66.228.42.5',
    '96.126.106.5',
    '50.116.53.5',
    '50.116.58.5',
    '50.116.61.5',
    '50.116.62.5',
    '66.175.211.5'
  ],
  dallas: [
    '173.255.199.5',
    '66.228.53.5',
    '96.126.122.5',
    '96.126.124.5',
    '96.126.127.5',
    '198.58.107.5',
    '198.58.111.5',
    '23.239.24.5'
  ],
  fremont: [
    '173.230.145.5',
    '173.230.147.5',
    '173.230.155.5',
    '173.255.212.5',
    '173.255.219.5',
    '173.255.241.5',
    '173.255.243.5',
    '173.255.244.5'
  ],
  atlanta: [
    '173.230.129.5',
    '173.230.136.5',
    '173.230.140.5',
    '66.228.59.5',
    '66.228.62.5',
    '50.116.35.5',
    '50.116.41.5',
    '23.239.18.5'
  ],
  london: [
    '178.79.182.5',
    '176.58.107.5',
    '176.58.116.5',
    '176.58.121.5',
    '151.236.220.5',
    '212.71.252.5',
    '212.71.253.5'
  ],
  tokyo: [
    '106.187.90.5',
    '106.187.93.5',
    '106.187.94.5',
    '106.187.95.5',
    '106.186.116.5',
    '106.186.123.5',
    '106.186.124.5'
  ],
  singapore: [
    '139.162.11.5',
    '139.162.13.5',
    '139.162.14.5',
    '139.162.15.5',
    '139.162.16.5',
    '139.162.21.5',
    '139.162.27.5'
  ],
  frankfurt: [
    '139.162.130.5',
    '139.162.131.5',
    '139.162.132.5',
    '139.162.133.5',
    '139.162.134.5',
    '139.162.135.5',
    '139.162.136.5',
    '139.162.137.5',
    '139.162.138.5',
    '139.162.139.5'
  ],
  shinagawa1: [
    '139.162.66.5',
    '139.162.67.5',
    '139.162.68.5',
    '139.162.69.5',
    '139.162.70.5',
    '139.162.71.5',
    '139.162.72.5',
    '139.162.73.5',
    '139.162.74.5',
    '139.162.75.5'
  ],
  toronto1: [
    '172.105.0.5',
    '172.105.3.5',
    '172.105.4.5',
    '172.105.5.5',
    '172.105.6.5',
    '172.105.7.5',
    '172.105.8.5',
    '172.105.9.5',
    '172.105.10.5',
    '172.105.11.5'
  ]
};

// Returns all 7 IPv6 resolvers for a given region.
//
// Each region has a prefix and 7 IPv6 resolvers that begin with this prefix.
// The tails of each resolver follow a convention standardized across all regions:
// ::5
// ::6
// ::7
// ::8
// ::9
// ::b
// ::c
export const getIPv6DNSResolvers = (region: Linode.ZoneName) => {
  const prefix = ipv6DNSResolverPrefixes[region];

  if (!region || !prefix) {
    return [];
  }

  return [
    `${prefix}5`,
    `${prefix}6`,
    `${prefix}7`,
    `${prefix}8`,
    `${prefix}9`,
    `${prefix}b`,
    `${prefix}c`
  ];
};

// IPv6 Prefixes for each region.
export const ipv6DNSResolverPrefixes: Record<Linode.ZoneName, string> = {
  newark: '2600:3c03::',
  dallas: '2600:3c00::',
  fremont: '2600:3c01::',
  atlanta: '2600:3c02::',
  london: '2a01:7e00::',
  tokyo: '2400:8900::',
  singapore: '2400:8901::',
  frankfurt: '2a01:7e01::',
  shinagawa1: '2400:8902::',
  toronto1: '2600:3C04::'
};
