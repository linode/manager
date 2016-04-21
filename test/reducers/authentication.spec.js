import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import authentication from '../../src/reducers/authentication';
import * as actions from '../../src/actions/authentication';

describe("authentication reducer", () => {
  it('should handle initial state', () => {
    expect(
      authentication(undefined, {})
    ).to.be.eql({ token: null });
  });

  it('should handle SET_TOKEN', () => {
    const state = authentication(undefined, {});
    const auth = { token: null };

    deepFreeze(state);

    expect(
      authentication(state, {
        type: actions.SET_TOKEN,
        scopes: [],
        username: 'me',
        email: 'me@example.org',
        token: 'token'
      })
    ).to.be.eql({
      scopes: [],
      username: 'me',
      email: 'me@example.org',
      token: 'token'
    });
  });

  it('should handle anything else', () => {
    const state = authentication(undefined, {});
    const auth = { token: null };

    expect(
      authentication(state, {
        scopes: [],
        username: 'me',
        email: 'me@example.org',
        token: 'token'
      })
    ).to.be.eql({ token: null });
  });
});
