import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import authentication from '../../src/reducers/authentication';
import * as actions from '../../src/actions/authentication';
import md5 from 'md5';

describe('authentication reducer', () => {
  it('should handle initial state', () => {
    expect(
      authentication(undefined, {})
    ).to.be.eql({
      token: null,
      username: null,
      email: null,
      emailHash: null,
      scopes: null,
    });
  });

  it('should handle SET_TOKEN', () => {
    const state = authentication(undefined, {});

    deepFreeze(state);

    expect(
      authentication(state, {
        type: actions.SET_TOKEN,
        scopes: [],
        username: 'me',
        email: 'me@example.org',
        emailHash: md5('me@example.org'.trim().toLowerCase()),
        token: 'token',
      })
    ).to.be.eql({
      scopes: [],
      username: 'me',
      email: 'me@example.org',
      emailHash: 'cd11923284fc0f904c4732bb8f7d7e3c',
      token: 'token',
    });
  });

  it('should handle anything else', () => {
    const state = authentication(undefined, {});
    deepFreeze(state);

    expect(
      authentication(state, {
        scopes: [],
        username: 'me',
        email: 'me@example.org',
        token: 'token',
      })
    ).to.be.deep.eql(state);
  });
});
