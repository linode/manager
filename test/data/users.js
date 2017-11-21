export const apiTestUser = {
  username: 'testuser1',
  email: 'example1@domain.com',
  restricted: false,
  password: 'crisprcas9',
};

export const testUser = {
  ...apiTestUser,
  _polling: false,
};

export const testPermissions = {
  global: {
    account_access: 'read_only',
    add_domains: true,
    add_images: true,
    add_linodes: true,
    add_longview: true,
    add_nodebalancers: true,
    add_stackscripts: true,
    add_volumes: true,
    cancel_account: false,
    longview_subscription: true,
  },
  linode: [
    {
      label: 'linode1',
      id: 1111,
      permissions: 'read_write',
    },
  ],
  nodebalancer: [
    {
      label: 'nb1',
      id: 2222,
      permissions: 'read_only',
    },
  ],
  domain: [
    {
      label: 'domain1',
      id: 3333,
      permissions: 'read_write',
    },
  ],
  stackscript: [
    {
      label: 'stackscript1',
      id: 4444,
      permissions: null,
    },
  ],
  longview: [
    {
      label: 'longview1',
      id: 5555,
      permissions: 'read_only',
    },
  ],
  image: [
    {
      label: 'image1',
      id: 6666,
      permissions: 'read_only',
    },
    {
      label: 'image2',
      id: 7777,
      permissions: 'read_write',
    },
  ],
  volume: [
    {
      label: 'volume1',
      id: 8888,
      permissions: null,
    },
  ],
};

export const testUser2 = {
  ...testUser,
  username: 'testuser2',
  email: 'example2@domain.com',
  restricted: true,
  _permissions: testPermissions,
};

export const users = [
  testUser,
  testUser2,
];
