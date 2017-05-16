import { expect } from 'chai';
import {
  SET_TOKEN,
  setToken,
} from '~/actions/authentication';

describe('actions/authentication', () => {
  it('should return set token', () => {
    const token = 'token';
    const scopes = 'scopes';

    const f = setToken(token, scopes);

    expect(f.type).to.equal(SET_TOKEN);
    expect(f.token).to.equal(token);
    expect(f.scopes).to.equal(scopes);
  });
});
