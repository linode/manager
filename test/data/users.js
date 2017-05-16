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
  customer: {
    access: true,
    cancel: false,
  },
  global: {
    add_linodes: true,
    add_nodebalancers: true,
    add_domains: true,
  },
  linode: [
    {
      all: true,
      access: true,
      delete: true,
      resize: true,
      label: 'linode1',
      id: 1234,
    },
  ],
  nodebalancer: [
    {
      all: true,
      access: true,
      delete: true,
      label: 'nb1',
      id: 4321,
    },
  ],
  dnszone: [
    {
      all: true,
      access: true,
      delete: true,
      label: 'domain1',
      id: 9876,
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
