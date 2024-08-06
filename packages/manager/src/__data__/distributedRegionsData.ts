import type { Region } from '@linode/api-v4';

export const distributedRegions: Region[] = [
  {
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-den-10',
    label: 'Gecko Distributed Region Test',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '139.162.130.5, 139.162.131.5, 139.162.132.5, 139.162.133.5, 139.162.134.5, 139.162.135.5, 139.162.136.5, 139.162.137.5, 139.162.138.5, 139.162.139.5',
      ipv6:
        '2a01:7e01::5, 2a01:7e01::9, 2a01:7e01::7, 2a01:7e01::c, 2a01:7e01::2, 2a01:7e01::4, 2a01:7e01::3, 2a01:7e01::6, 2a01:7e01::b, 2a01:7e01::8',
    },
    site_type: 'distributed',
    status: 'ok',
  },
  {
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-den-11',
    label: 'Gecko Distributed Region Test 2',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '139.162.130.5, 139.162.131.5, 139.162.132.5, 139.162.133.5, 139.162.134.5, 139.162.135.5, 139.162.136.5, 139.162.137.5, 139.162.138.5, 139.162.139.5',
      ipv6:
        '2a01:7e01::5, 2a01:7e01::9, 2a01:7e01::7, 2a01:7e01::c, 2a01:7e01::2, 2a01:7e01::4, 2a01:7e01::3, 2a01:7e01::6, 2a01:7e01::b, 2a01:7e01::8',
    },
    site_type: 'distributed',
    status: 'ok',
  },
];
