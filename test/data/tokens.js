export const apiTestToken = {
  created: '2016-12-12T15:07:47',
  label: 'personal',
  id: 1,
  expiry: '2290-09-26T14:07:47',
  client: null,
  scopes: '*',
  token: '3b124d11f2f264e0...',
  type: 'personal_access_token',
};

export const testToken = {
  ...apiTestToken,
  _polling: false,
};

export const tokens = {
  [testToken.id]: testToken,
  2: {
    ...testToken,
    id: 2,
    label: '',
    type: 'client_token',
    client: {
      id: 'd64b169cc95fde4e367g',
      redirect_uri: 'http://localhost:9999/oauth/callback',
      label: 'Test client',
    },
  },
  3: {
    ...testToken,
    id: 3,
    label: '',
    type: 'client_token',
    client: {
      id: 'd64b169cc95fde4e367h',
      redirect_uri: 'http://localhost:9999/oauth/callback',
      label: 'Test client 123',
    },
    scopes: 'linodes:*,nodebalancers:create',
  },
};
