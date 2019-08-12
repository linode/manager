export const regions = [
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'in',
    id: 'ap-west'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'ca',
    id: 'ca-central'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'us',
    id: 'us-central'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'us',
    id: 'us-west'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers'],
    country: 'us',
    id: 'us-southeast'
  },
  {
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Object Storage'
    ],
    country: 'us',
    id: 'us-east'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'uk',
    id: 'eu-west'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'sg',
    id: 'ap-south'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'de',
    id: 'eu-central'
  },
  {
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'jp',
    id: 'ap-northeast'
  }
];

export const extendedRegions = regions.map(thisRegion => ({
  ...thisRegion,
  display: thisRegion.id
}));
