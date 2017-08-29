export const apiTestVolume = {
  id: 38,
  label: 'test',
  linode_id: null,
  status: 'active',
  created: '2017-08-08T13:55:16',
  region: {
    id: 'us-east-1a',
    label: 'Newark, NJ',
    country: 'us',
  },
  updated: '2017-08-08T04:00:00',
  size: 20,
};

export const testVolume = {
  ...apiTestVolume,
  _polling: false,
};

export const volumes = [
  testVolume,
];
