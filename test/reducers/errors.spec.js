import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import errors from '../../src/reducers/errors';
import * as actions from '../../src/actions/errors';

describe('reducers/errors', () => {
  const defaultState = {
    status: null,
  };
  deepFreeze(defaultState);

  it('should handle initial state', () => {
    expect(
      errors(undefined, {})
    ).to.deep.equal(defaultState);
  });

  it('should handle SET_ERROR', () => {
    expect(
      errors(defaultState, {
        type: actions.SET_ERROR,
        status: 404,
      })
    ).to.deep.equal({
      ...defaultState,
      status: 404,
    });
  });

  it('should handle TOGGLE_DETAILS', () => {
    expect(
      errors(defaultState, { type: actions.TOGGLE_DETAILS })
    ).to.deep.equal({
      ...defaultState,
    });
  });
});
