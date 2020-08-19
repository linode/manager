import { Region } from '@linode/api-v4/lib/regions';

const resolvers = {
  ipv4: '8.8.8.8',
  ipv6: '2600:3c03::5'
};

export const regions: Region[] = [
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'in',
    id: 'ap-west',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'au',
    id: 'ap-southeast',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'ca',
    id: 'ca-central',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'us',
    id: 'us-central',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'us',
    id: 'us-west',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers'],
    country: 'us',
    id: 'us-southeast',
    status: 'ok',
    resolvers
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage'
    ],
    country: 'us',
    id: 'us-east',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'uk',
    id: 'eu-west',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'sg',
    id: 'ap-south',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'de',
    id: 'eu-central',
    status: 'ok',
    resolvers
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'jp',
    id: 'ap-northeast',
    status: 'ok',
    resolvers
  }
];

export const extendedRegions = regions.map(thisRegion => ({
  ...thisRegion,
  display: thisRegion.id
}));
