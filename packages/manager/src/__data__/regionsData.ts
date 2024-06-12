import { Region } from '@linode/api-v4/lib/regions';

export const regions: Region[] = [
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'GPU Linodes',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
    ],
    country: 'in',
    id: 'ap-west',
    label: 'Mumbai, IN',
    placement_group_limits: {
      maximum_linodes_per_pg: 5,
      maximum_pgs_per_customer: 10,
    },
    resolvers: {
      ipv4:
        '172.105.34.5, 172.105.35.5, 172.105.36.5, 172.105.37.5, 172.105.38.5, 172.105.39.5, 172.105.40.5, 172.105.41.5, 172.105.42.5, 172.105.43.5',
      ipv6:
        '2400:8904::f03c:91ff:fea5:659, 2400:8904::f03c:91ff:fea5:9282, 2400:8904::f03c:91ff:fea5:b9b3, 2400:8904::f03c:91ff:fea5:925a, 2400:8904::f03c:91ff:fea5:22cb, 2400:8904::f03c:91ff:fea5:227a, 2400:8904::f03c:91ff:fea5:924c, 2400:8904::f03c:91ff:fea5:f7e2, 2400:8904::f03c:91ff:fea5:2205, 2400:8904::f03c:91ff:fea5:9207',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
      'Placement Group',
    ],
    country: 'ca',
    id: 'ca-central',
    label: 'Toronto, CA',
    placement_group_limits: {
      maximum_linodes_per_pg: 1,
      maximum_pgs_per_customer: null,
    },
    resolvers: {
      ipv4:
        '172.105.0.5, 172.105.3.5, 172.105.4.5, 172.105.5.5, 172.105.6.5, 172.105.7.5, 172.105.8.5, 172.105.9.5, 172.105.10.5, 172.105.11.5',
      ipv6:
        '2600:3c04::f03c:91ff:fea9:f63, 2600:3c04::f03c:91ff:fea9:f6d, 2600:3c04::f03c:91ff:fea9:f80, 2600:3c04::f03c:91ff:fea9:f0f, 2600:3c04::f03c:91ff:fea9:f99, 2600:3c04::f03c:91ff:fea9:fbd, 2600:3c04::f03c:91ff:fea9:fdd, 2600:3c04::f03c:91ff:fea9:fe2, 2600:3c04::f03c:91ff:fea9:f68, 2600:3c04::f03c:91ff:fea9:f4a',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
    ],
    country: 'au',
    id: 'ap-southeast',
    label: 'Sydney, AU',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.105.166.5, 172.105.169.5, 172.105.168.5, 172.105.172.5, 172.105.162.5, 172.105.170.5, 172.105.167.5, 172.105.171.5, 172.105.181.5, 172.105.161.5',
      ipv6:
        '2400:8907::f03c:92ff:fe6e:ec8, 2400:8907::f03c:92ff:fe6e:98e4, 2400:8907::f03c:92ff:fe6e:1c58, 2400:8907::f03c:92ff:fe6e:c299, 2400:8907::f03c:92ff:fe6e:c210, 2400:8907::f03c:92ff:fe6e:c219, 2400:8907::f03c:92ff:fe6e:1c5c, 2400:8907::f03c:92ff:fe6e:c24e, 2400:8907::f03c:92ff:fe6e:e6b, 2400:8907::f03c:92ff:fe6e:e3d',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Managed Databases',
      'Metadata',
      'Premium Plans',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-iad',
    label: 'Washington, DC',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '139.144.192.62,   139.144.192.60,   139.144.192.61,   139.144.192.53,   139.144.192.54,   139.144.192.67,   139.144.192.69,    139.144.192.66,   139.144.192.52,   139.144.192.68',
      ipv6:
        '2600:3c05::f03c:93ff:feb6:43b6,   2600:3c05::f03c:93ff:feb6:4365,   2600:3c05::f03c:93ff:feb6:43c2,   2600:3c05::f03c:93ff:feb6:e441,   2600:3c05::f03c:93ff:feb6:94ef,   2600:3c05::f03c:93ff:feb6:94ba,   2600:3c05::f03c:93ff:feb6:94a8,   2600:3c05::f03c:93ff:feb6:9413,   2600:3c05::f03c:93ff:feb6:9443,   2600:3c05::f03c:93ff:feb6:94e0',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Managed Databases',
      'Metadata',
      'Premium Plans',
    ],
    country: 'us',
    id: 'us-ord',
    label: 'Chicago, IL',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.232.0.17,   172.232.0.16,   172.232.0.21,   172.232.0.13,   172.232.0.22,   172.232.0.9,   172.232.0.19,   172.232.0.20,   172.232.0.15,   172.232.0.18',
      ipv6:
        '2600:3c06::f03c:93ff:fed0:e5fc,   2600:3c06::f03c:93ff:fed0:e54b,   2600:3c06::f03c:93ff:fed0:e572,   2600:3c06::f03c:93ff:fed0:e530,   2600:3c06::f03c:93ff:fed0:e597,   2600:3c06::f03c:93ff:fed0:e511,   2600:3c06::f03c:93ff:fed0:e5f2,   2600:3c06::f03c:93ff:fed0:e5bf,   2600:3c06::f03c:93ff:fed0:e529,   2600:3c06::f03c:93ff:fed0:e5a3',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Managed Databases',
      'Metadata',
      'Premium Plans',
    ],
    country: 'fr',
    id: 'fr-par',
    label: 'Paris, FR',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.232.32.21,  172.232.32.23,  172.232.32.17,  172.232.32.18,  172.232.32.16,  172.232.32.22,  172.232.32.20,  172.232.32.14,  172.232.32.11,  172.232.32.12',
      ipv6:
        '2600:3c07::f03c:93ff:fef2:2e63,  2600:3c07::f03c:93ff:fef2:2ec7,  2600:3c07::f03c:93ff:fef2:0dee,  2600:3c07::f03c:93ff:fef2:0d25,  2600:3c07::f03c:93ff:fef2:0de0,  2600:3c07::f03c:93ff:fef2:2e29,  2600:3c07::f03c:93ff:fef2:0dda,  2600:3c07::f03c:93ff:fef2:0d82,  2600:3c07::f03c:93ff:fef2:b3ac,  2600:3c07::f03c:93ff:fef2:b3a8',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-sea',
    label: 'Seattle, WA',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.232.160.19, 172.232.160.21, 172.232.160.17, 172.232.160.15, 172.232.160.18, 172.232.160.8, 172.232.160.12, 172.232.160.11, 172.232.160.14, 172.232.160.16',
      ipv6:
        '2600:3c0a::f03c:93ff:fe54:c6da, 2600:3c0a::f03c:93ff:fe54:c691, 2600:3c0a::f03c:93ff:fe54:c68d, 2600:3c0a::f03c:93ff:fe54:c61e, 2600:3c0a::f03c:93ff:fe54:c653, 2600:3c0a::f03c:93ff:fe54:c64c, 2600:3c0a::f03c:93ff:fe54:c68a, 2600:3c0a::f03c:93ff:fe54:c697, 2600:3c0a::f03c:93ff:fe54:c60f, 2600:3c0a::f03c:93ff:fe54:c6a0',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
      'Placement Group',
    ],
    country: 'br',
    id: 'br-gru',
    label: 'Sao Paulo, BR',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.233.0.4, 172.233.0.9, 172.233.0.7, 172.233.0.12, 172.233.0.5, 172.233.0.13, 172.233.0.10, 172.233.0.6, 172.233.0.8, 172.233.0.11',
      ipv6:
        '2600:3c0d::f03c:93ff:fe3d:51cb, 2600:3c0d::f03c:93ff:fe3d:51a7, 2600:3c0d::f03c:93ff:fe3d:51a9, 2600:3c0d::f03c:93ff:fe3d:5119, 2600:3c0d::f03c:93ff:fe3d:51fe, 2600:3c0d::f03c:93ff:fe3d:517c, 2600:3c0d::f03c:93ff:fe3d:5144, 2600:3c0d::f03c:93ff:fe3d:5170, 2600:3c0d::f03c:93ff:fe3d:51cc, 2600:3c0d::f03c:93ff:fe3d:516c',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
    ],
    country: 'nl',
    id: 'nl-ams',
    label: 'Amsterdam, NL',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.233.33.36, 172.233.33.38, 172.233.33.35, 172.233.33.39, 172.233.33.34, 172.233.33.33, 172.233.33.31, 172.233.33.30, 172.233.33.37, 172.233.33.32',
      ipv6:
        '2600:3c0e::f03c:93ff:fe9d:2d10, 2600:3c0e::f03c:93ff:fe9d:2d89, 2600:3c0e::f03c:93ff:fe9d:2d79, 2600:3c0e::f03c:93ff:fe9d:2d96, 2600:3c0e::f03c:93ff:fe9d:2da5, 2600:3c0e::f03c:93ff:fe9d:2d34, 2600:3c0e::f03c:93ff:fe9d:2d68, 2600:3c0e::f03c:93ff:fe9d:2d17, 2600:3c0e::f03c:93ff:fe9d:2d45, 2600:3c0e::f03c:93ff:fe9d:2d5c',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
    ],
    country: 'se',
    id: 'se-sto',
    label: 'Stockholm, SE',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.232.128.24, 172.232.128.26, 172.232.128.20, 172.232.128.22, 172.232.128.25, 172.232.128.19, 172.232.128.23, 172.232.128.18, 172.232.128.21, 172.232.128.27',
      ipv6:
        '2600:3c09::f03c:93ff:fea9:4dbe, 2600:3c09::f03c:93ff:fea9:4d63, 2600:3c09::f03c:93ff:fea9:4dce, 2600:3c09::f03c:93ff:fea9:4dbb, 2600:3c09::f03c:93ff:fea9:4d99, 2600:3c09::f03c:93ff:fea9:4d26, 2600:3c09::f03c:93ff:fea9:4de0, 2600:3c09::f03c:93ff:fea9:4d69, 2600:3c09::f03c:93ff:fea9:4dbf, 2600:3c09::f03c:93ff:fea9:4da6',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
    ],
    country: 'in',
    id: 'in-maa',
    label: 'Chennai, IN',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.232.96.17, 172.232.96.26, 172.232.96.19, 172.232.96.20, 172.232.96.25, 172.232.96.21, 172.232.96.18, 172.232.96.22, 172.232.96.23, 172.232.96.24',
      ipv6:
        '2600:3c08::f03c:93ff:fe7c:1135, 2600:3c08::f03c:93ff:fe7c:11f8, 2600:3c08::f03c:93ff:fe7c:11d2, 2600:3c08::f03c:93ff:fe7c:11a7, 2600:3c08::f03c:93ff:fe7c:11ad, 2600:3c08::f03c:93ff:fe7c:110a, 2600:3c08::f03c:93ff:fe7c:11f9, 2600:3c08::f03c:93ff:fe7c:1137, 2600:3c08::f03c:93ff:fe7c:11db, 2600:3c08::f03c:93ff:fe7c:1164',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
      'Placement Group',
    ],
    country: 'jp',
    id: 'jp-osa',
    label: 'Osaka, JP',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.233.64.44, 172.233.64.43, 172.233.64.37, 172.233.64.40, 172.233.64.46, 172.233.64.41, 172.233.64.39, 172.233.64.42, 172.233.64.45, 172.233.64.38',
      ipv6:
        '2400:8905::f03c:93ff:fe9d:b085, 2400:8905::f03c:93ff:fe9d:b012, 2400:8905::f03c:93ff:fe9d:b09b, 2400:8905::f03c:93ff:fe9d:b0d8, 2400:8905::f03c:93ff:fe9d:259f, 2400:8905::f03c:93ff:fe9d:b006, 2400:8905::f03c:93ff:fe9d:b084, 2400:8905::f03c:93ff:fe9d:b0ce, 2400:8905::f03c:93ff:fe9d:25ea, 2400:8905::f03c:93ff:fe9d:b086',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
    ],
    country: 'it',
    id: 'it-mil',
    label: 'Milan, IT',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.232.192.19, 172.232.192.18, 172.232.192.16, 172.232.192.20, 172.232.192.24, 172.232.192.21, 172.232.192.22, 172.232.192.17, 172.232.192.15, 172.232.192.23',
      ipv6:
        '2600:3c0b::f03c:93ff:feba:d513, 2600:3c0b::f03c:93ff:feba:d5c3, 2600:3c0b::f03c:93ff:feba:d597, 2600:3c0b::f03c:93ff:feba:d5fb, 2600:3c0b::f03c:93ff:feba:d51f, 2600:3c0b::f03c:93ff:feba:d58e, 2600:3c0b::f03c:93ff:feba:d5d5, 2600:3c0b::f03c:93ff:feba:d534, 2600:3c0b::f03c:93ff:feba:d57c, 2600:3c0b::f03c:93ff:feba:d529',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-mia',
    label: 'Miami, FL',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.233.160.34, 172.233.160.27, 172.233.160.30, 172.233.160.29, 172.233.160.32, 172.233.160.28, 172.233.160.33, 172.233.160.26, 172.233.160.25, 172.233.160.31',
      ipv6:
        '2a01:7e04::f03c:93ff:fead:d31f, 2a01:7e04::f03c:93ff:fead:d37f, 2a01:7e04::f03c:93ff:fead:d30c, 2a01:7e04::f03c:93ff:fead:d318, 2a01:7e04::f03c:93ff:fead:d316, 2a01:7e04::f03c:93ff:fead:d339, 2a01:7e04::f03c:93ff:fead:d367, 2a01:7e04::f03c:93ff:fead:d395, 2a01:7e04::f03c:93ff:fead:d3d0, 2a01:7e04::f03c:93ff:fead:d38e',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
    ],
    country: 'id',
    id: 'id-cgk',
    label: 'Jakarta, ID',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.232.224.23, 172.232.224.32, 172.232.224.26, 172.232.224.27, 172.232.224.21, 172.232.224.24, 172.232.224.22, 172.232.224.20, 172.232.224.31, 172.232.224.28',
      ipv6:
        '2600:3c0c::f03c:93ff:feed:a90b, 2600:3c0c::f03c:93ff:feed:a9a5, 2600:3c0c::f03c:93ff:feed:a935, 2600:3c0c::f03c:93ff:feed:a930, 2600:3c0c::f03c:93ff:feed:a95c, 2600:3c0c::f03c:93ff:feed:a9ad, 2600:3c0c::f03c:93ff:feed:a9f2, 2600:3c0c::f03c:93ff:feed:a9ff, 2600:3c0c::f03c:93ff:feed:a9c8, 2600:3c0c::f03c:93ff:feed:a96b',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Metadata',
      'Premium Plans',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-lax',
    label: 'Los Angeles, CA',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '172.233.128.45, 172.233.128.38, 172.233.128.53, 172.233.128.37, 172.233.128.34, 172.233.128.36, 172.233.128.33, 172.233.128.39, 172.233.128.43, 172.233.128.44',
      ipv6:
        '2a01:7e03::f03c:93ff:feb1:b789, 2a01:7e03::f03c:93ff:feb1:b717, 2a01:7e03::f03c:93ff:feb1:b707, 2a01:7e03::f03c:93ff:feb1:b7ab, 2a01:7e03::f03c:93ff:feb1:b7e2, 2a01:7e03::f03c:93ff:feb1:b709, 2a01:7e03::f03c:93ff:feb1:b7a6, 2a01:7e03::f03c:93ff:feb1:b750, 2a01:7e03::f03c:93ff:feb1:b76e, 2a01:7e03::f03c:93ff:feb1:b7a2',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-central',
    label: 'Dallas, TX',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '72.14.179.5, 72.14.188.5, 173.255.199.5, 66.228.53.5, 96.126.122.5, 96.126.124.5, 96.126.127.5, 198.58.107.5, 198.58.111.5, 23.239.24.5',
      ipv6:
        '2600:3c00::2, 2600:3c00::9, 2600:3c00::7, 2600:3c00::5, 2600:3c00::3, 2600:3c00::8, 2600:3c00::6, 2600:3c00::4, 2600:3c00::c, 2600:3c00::b',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Block Storage Migrations',
      'Managed Databases',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-west',
    label: 'Fremont, CA',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 1,
    },
    resolvers: {
      ipv4:
        '173.230.145.5, 173.230.147.5, 173.230.155.5, 173.255.212.5, 173.255.219.5, 173.255.241.5, 173.255.243.5, 173.255.244.5, 74.207.241.5, 74.207.242.5',
      ipv6:
        '2600:3c01::2, 2600:3c01::9, 2600:3c01::5, 2600:3c01::7, 2600:3c01::3, 2600:3c01::8, 2600:3c01::4, 2600:3c01::b, 2600:3c01::c, 2600:3c01::6',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'GPU Linodes',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-southeast',
    label: 'Atlanta, GA',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '74.207.231.5, 173.230.128.5, 173.230.129.5, 173.230.136.5, 173.230.140.5, 66.228.59.5, 66.228.62.5, 50.116.35.5, 50.116.41.5, 23.239.18.5',
      ipv6:
        '2600:3c02::3, 2600:3c02::5, 2600:3c02::4, 2600:3c02::6, 2600:3c02::c, 2600:3c02::7, 2600:3c02::2, 2600:3c02::9, 2600:3c02::8, 2600:3c02::b',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'GPU Linodes',
      'Kubernetes',
      'Cloud Firewall',
      'Bare Metal',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
      'Placement Group',
    ],
    country: 'us',
    id: 'us-east',
    label: 'Newark, NJ',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '66.228.42.5, 96.126.106.5, 50.116.53.5, 50.116.58.5, 50.116.61.5, 50.116.62.5, 66.175.211.5, 97.107.133.4, 207.192.69.4, 207.192.69.5',
      ipv6:
        '2600:3c03::7, 2600:3c03::4, 2600:3c03::9, 2600:3c03::6, 2600:3c03::3, 2600:3c03::c, 2600:3c03::5, 2600:3c03::b, 2600:3c03::2, 2600:3c03::8',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
    ],
    country: 'gb',
    id: 'eu-west',
    label: 'London, UK',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '178.79.182.5,  176.58.107.5,  176.58.116.5,  176.58.121.5,  151.236.220.5,  212.71.252.5,  212.71.253.5,  109.74.192.20,  109.74.193.20,  109.74.194.20',
      ipv6:
        '2a01:7e00::9,  2a01:7e00::3,  2a01:7e00::c,  2a01:7e00::5,  2a01:7e00::6,  2a01:7e00::8,  2a01:7e00::b,  2a01:7e00::4,  2a01:7e00::7,  2a01:7e00::2',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'GPU Linodes',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
    ],
    country: 'sg',
    id: 'ap-south',
    label: 'Singapore, SG',
    placement_group_limits: {
      maximum_linodes_per_pg: 10,
      maximum_pgs_per_customer: 5,
    },
    resolvers: {
      ipv4:
        '139.162.11.5, 139.162.13.5, 139.162.14.5, 139.162.15.5, 139.162.16.5, 139.162.21.5, 139.162.27.5, 103.3.60.18, 103.3.60.19, 103.3.60.20',
      ipv6:
        '2400:8901::5, 2400:8901::4, 2400:8901::b, 2400:8901::3, 2400:8901::9, 2400:8901::2, 2400:8901::8, 2400:8901::7, 2400:8901::c, 2400:8901::6',
    },
    site_type: 'core',
    status: 'ok',
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage',
      'GPU Linodes',
      'Kubernetes',
      'Cloud Firewall',
      'Vlans',
      'VPCs',
      'Block Storage Migrations',
      'Managed Databases',
    ],
    country: 'de',
    id: 'eu-central',
    label: 'Frankfurt, DE',
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
    site_type: 'core',
    status: 'ok',
  },
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
