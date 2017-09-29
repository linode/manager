export const apiTestClient = {
  status: 'active',
  label: 'My client',
  id: '1',
  redirect_uri: 'http://localhost:3000/oauth/callback',
  secret: '<REDACTED>',
  thumbnail_url: '/account/clients/1/thumbnail',
};

export const testClient = {
  ...apiTestClient,
  _polling: false,
};

export const clients = {
  [testClient.id]: testClient,
};
