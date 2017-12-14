export const apiTestImage = {
  id: 'linode/arch2016.05',
  recommended: true,
  vendor: 'Arch',
  label: 'Arch Linux 2016.05',
  last_used: '2009-08-17T00:00:00',
  min_deploy_size: 550,
  filesystem: 'ext4',
  created: '2009-01-01T00:00:00',
  description: 'Test Image',
  status: 'available',
  type: 'manual',
  creator: 'linode',
  is_public: true,
  deprecated: false,
};

export const testLinodeImage = {
  ...apiTestImage,
  _polling: false,
};

export const publicImages = {
  'linode/arch2016.05': testLinodeImage,
  'linode/debian7': {
    ...testLinodeImage,
    id: 'linode/debian7',
    vendor: 'Debian',
    label: 'Debian 7',
  },
  'linode/debian8.1': {
    ...testLinodeImage,
    id: 'linode/debian8.1',
    vendor: 'Debian',
    label: 'Debian 8.1',
  },
  'linode/debian6': {
    ...testLinodeImage,
    id: 'linode/debian6',
    recommended: false,
    vendor: 'Debian',
    label: 'Debian 6',
  },
};

export const testPrivateImage = {
  ...testLinodeImage,
  id: 'private/38',
  label: 'testImage',
  description: 'image details',
  filesystem: 'ext4',
  status: 'available',
  vendor: 'Unknown',
  created: '2017-08-08T13:55:16',
  last_used: '2017-089-08T13:55:16',
  creator: 'zues',
  min_deploy_size: 2048,
  type: 'manual',
  is_public: false,
};

export const privateImages = {
  'private/38': testPrivateImage,
  'private/39': {
    ...testPrivateImage,
    id: 'private/39',
    label: 'nextImage',
    description: 'image from deleted disk',
    filesystem: 'raw',
    status: 'available',
    created: '2017-08-08T13:55:16',
    last_used: '2017-089-08T13:55:16',
    creator: 'zues',
    min_deploy_size: 2048,
    type: 'automatic',
    is_public: false,
  },
};

export const images = {
  ...privateImages,
  ...publicImages,
};
