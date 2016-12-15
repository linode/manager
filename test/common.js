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
export async function expectRequest(fn, path, dispatched = () => {},
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
    for (let i = 0; i < dispatch.callCount; ++i) {
      dispatched(dispatch.getCall(i), i);
    }
  } finally {
    sandbox.restore();
  }
}

class InternalAssertionError extends Error {
  constructor(aVal, bVal, keyPath) {
    super();
    const keyPathString = `.${keyPath.join('.')}`;
    this.message =
      `Expected 'a' at ${keyPathString} (${aVal}) to equal 'b' at ${keyPathString} (${bVal})`;
  }
}

class InternalAssertionTypeError extends Error {
  constructor(aVal, bVal, keyPath) {
    super();
    const keyPathString = `.${keyPath.join('.')}`;
    this.message =
      (`Expected type of 'a' at ${keyPathString} (${aVal}) ` +
       `to equal type of 'b' at ${keyPathString} (${bVal})`);
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
function isObject(o) {
  return o === Object(o);
}

export function expectObjectDeepEquals(a, b, keyPath = []) {
  if (isObject(a)) {
    if (!isObject(b)) {
      throw new InternalAssertionTypeError(a, b, keyPath);
    }

    Object.keys(a).forEach(aKey => {
      const aVal = a[aKey];
      const bVal = b[aKey];

      expectObjectDeepEquals(aVal, bVal, [...keyPath, aKey]);
    });

    Object.keys(b).forEach(bKey => {
      if (a[bKey] === undefined) {
        throw new InternalAssertionError(a[bKey], b[bKey], keyPath);
      }
    });
  } else if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      throw new InternalAssertionTypeError(a, b, keyPath);
    } else if (a.length !== b.length) {
      throw new InternalAssertionError(a, b, keyPath);
    }

    a.forEach((aVal, i) => {
      expectObjectDeepEquals(aVal, b[i], [...keyPath, i]);
    });
  } else {
    if (a !== b) {
      throw new InternalAssertionError(a, b, keyPath);
    }
  }
}
