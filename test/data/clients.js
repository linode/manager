export const apiTestClient = {
  status: 'active',
  name: 'My client',
  id: '1',
  redirect_uri: 'http://localhost:3000/oauth/callback',
  secret: '<REDACTED>',
};

export const testClient = {
  ...apiTestClient,
  _polling: false,
};

export const clients = {
  [testClient.id]: testClient,
};
