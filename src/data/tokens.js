export const apiTestToken = {
  created: '2016-12-12T15:07:47',
  label: 'personal',
  id: 1,
  expiry: '2290-09-26T14:07:47',
  scopes: '*',
  token: '3b124d11f2f264e0...',
};

export const testToken = {
  ...apiTestToken,
  _polling: false,
};

export const tokens = {
  [testToken.id]: testToken,
};
