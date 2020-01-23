import { Region } from 'linode-js-sdk/lib/regions';

export const regions: Region[] = [
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'in',
    id: 'ap-west',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'au',
    id: 'ap-southeast',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'ca',
    id: 'ca-central',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'us',
    id: 'us-central',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'us',
    id: 'us-west',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers'],
    country: 'us',
    id: 'us-southeast',
    status: 'ok'
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
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'uk',
    id: 'eu-west',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'sg',
    id: 'ap-south',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'de',
    id: 'eu-central',
    status: 'ok'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'jp',
    id: 'ap-northeast',
    status: 'ok'
  }
];

export const extendedRegions = regions.map(thisRegion => ({
  ...thisRegion,
  display: thisRegion.id
}));
