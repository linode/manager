export const apiTestImage = {
  id: 38,
  label: 'testImage',
  description: 'image details',
  filesystem: 'ext4',
  status: 'available',
  created: '2017-08-08T13:55:16',
  updated: '2017-08-08T04:00:00',
  last_used: '2017-089-08T13:55:16',
  creator: 'zues',
  min_deploy_size: 2048,
  type: 'manual',
  is_public: false,
};

export const testImage = {
  ...apiTestImage,
  _polling: false,
};

export const images = [
  testImage,
];
