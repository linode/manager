import * as fetch from '~/fetch';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Asserts that a certain kind of request occurs when you invoke the provided
 * function.
 * @param {Function} fn - The (async) function to invoke.
 * @param {string} path - The path you expect it to be called with.
 * @param {Object} state - State to be returned by getState
 * @param {Object} options - Any options passed to fetch you wish to assert.
 * @param {Function} dispatched - A function to be invoked with each call that
 * occured to dispatch
 */
export async function expectRequest(fn, path, state = null,
    dispatched = () => {}, options = null) {
  const sandbox = sinon.sandbox.create();
  try {
    expect(fn).to.be.a('function');
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    const dispatch = sinon.spy();
    await fn(dispatch, () => state || { authentication: { token: 'token' } });
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal(path);
    if (options) {
      expect(fetchStub.firstCall.args[2]).to.equal(path);
    }
    expect(dispatch.calledOnce).to.equal(true);
    for (let i = 0; i < dispatch.callCount; ++i) {
      dispatched(dispatch.getCall(i));
    }
  } finally {
    sandbox.restore();
  }
}
