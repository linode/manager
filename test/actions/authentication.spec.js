import sinon from 'sinon';
import { expect } from 'chai';
import {
  SET_TOKEN,
  setToken,
} from '~/actions/authentication';

describe('actions/authentication', sinon.test(() => {
  it('should return set token', () => {
    const token = 'token';
    const scopes = 'scopes';
    const username = 'peanut';
    const email = 'peanut@domain.com';

    const f = setToken(token, scopes, username, email);

    expect(f.type).to.equal(SET_TOKEN);
    expect(f.token).to.equal(token);
    expect(f.scopes).to.equal(scopes);
    expect(f.username).to.equal(username);
    expect(f.email).to.equal(email);
  });
}));
