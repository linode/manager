export const rawFetch = jest.fn(() => ({
  json: jest.fn(() => ({ access_token: 'access_token', scope: '*' })),
}));
