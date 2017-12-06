import {
  SET_TOKEN,
  setToken,
} from '~/actions/authentication';

describe('actions/authentication', () => {
  it('should return set token', () => {
    const token = 'token';
    const scopes = 'scopes';

    const f = setToken(token, scopes);

    expect(f.type).toBe(SET_TOKEN);
    expect(f.token).toBe(token);
    expect(f.scopes).toBe(scopes);
  });
});
