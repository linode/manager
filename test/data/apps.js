export const apiTestApp = {
  created: '2016-12-12T15:07:47',
  label: 'Test client',
  id: 2,
  expiry: '2290-09-26T14:07:47',
  scopes: 'linodes:*,nodebalancers:create',
  thumbnail_url: null,
};

export const testApp = {
  ...apiTestApp,
  _polling: false,
};

export const apps = {
  [testApp.id]: testApp,
};
