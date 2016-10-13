import * as fetch from '~/fetch';
import { expect } from 'chai';
import sinon from 'sinon';
import { state as defaultState } from '@/data';

/**
 * Asserts that a certain kind of request occurs when you invoke the provided
 * function.
 * @param {Function} fn - The (async) function to invoke
 * @param {string} path - The path you expect it to be called with
 * @param {Function} dispatched - A function to be invoked with each call that
 * @param {Object} response - Response JSON to return from the fetch call
 * @param {Object} options - Any options passed to fetch you wish to assert
 * @param {Object} state - State to be returned by getState
 * occured to dispatch
 */
export default async function expectRequest(fn, path, dispatched = () => {},
    response = null, options = null, _state = null) {
  const state = _state || defaultState;
  const sandbox = sinon.sandbox.create();
  try {
    expect(fn).to.be.a('function');
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => response || { },
    });
    const dispatch = sinon.spy();
    await fn(dispatch, () => state);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal(path);
    if (options) {
      const o = fetchStub.firstCall.args[2];
      if (typeof options === 'function') {
        options(o);
      } else {
        Object.keys(options).map(k =>
          expect(options[k]).to.equal(o[k]));
      }
    }
    for (let i = 0; i < dispatch.callCount; i += 1) {
      dispatched(dispatch.getCall(i), i);
    }
  } finally {
    sandbox.restore();
  }
}
