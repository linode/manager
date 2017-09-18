import { apiTestRegion } from './regions';


export const apiTestVolume = {
  id: 38,
  label: 'test',
  linode_id: null,
  status: 'active',
  created: '2017-08-08T13:55:16',
  region: apiTestRegion.id,
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
