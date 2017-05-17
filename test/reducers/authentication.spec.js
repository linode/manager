import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

import authentication from '~/reducers/authentication';
import * as actions from '~/actions/authentication';


describe('authentication reducer', () => {
  it('should handle initial state', () => {
    expect(
      authentication(undefined, {})
    ).to.be.eql({
      token: null,
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
        token: 'token',
      })
    ).to.be.eql({
      scopes: [],
      token: 'token',
    });
  });

  it('should handle anything else', () => {
    const state = authentication(undefined, {});
    deepFreeze(state);

    expect(
      authentication(state, {
        scopes: [],
        token: 'token',
      })
    ).to.be.deep.eql(state);
  });
});
