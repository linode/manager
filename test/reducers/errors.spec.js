import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import errors from '../../src/reducers/errors';
import * as actions from '../../src/actions/errors';

describe('reducers/errors', () => {
  const defaultState = {
    json: null,
    status: null,
    statusText: null,
    details: false,
  };
  deepFreeze(defaultState);

  it('should handle initial state', () => {
    window.localStorage.clear();
    expect(
      errors(undefined, {})
    ).to.deep.equal(defaultState);
  });

  it('should handle SET_ERROR', () => {
    expect(
      errors(defaultState, {
        type: actions.SET_ERROR,
        status: 400,
        statusText: 'Bad Request',
        json: { },
      })
    ).to.deep.equal({
      ...defaultState,
      status: 400,
      statusText: 'Bad Request',
      json: { },
    });
  });

  it('should handle TOGGLE_DETAILS', () => {
    expect(
      errors(defaultState, { type: actions.TOGGLE_DETAILS })
    ).to.deep.equal({
      ...defaultState,
      details: !defaultState.details,
    });
  });
});
