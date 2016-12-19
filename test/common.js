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
    expect(fetchStub.callCount).to.equal(1);
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

export function expectObjectDeepEquals(initialA, initialB) {
  const stackA = [{ a: initialA, path: [] }];
  const stackB = [initialB];

  while (stackA.length) {
    const { a, path } = stackA.pop();
    const b = stackB.pop();

    if (isObject(a)) {
      if (!isObject(b)) {
        throw new InternalAssertionTypeError(a, b, path);
      }

      Object.keys(a).forEach(aKey => {
        stackA.push({ a: a[aKey], path: [...path, aKey] });
        stackB.push(b[aKey]);
      });

      Object.keys(b).forEach(bKey => {
        if (a[bKey] === undefined) {
          throw new InternalAssertionError(a[bKey], b[bKey], path);
        }
      });
    } else if (Array.isArray(a)) {
      if (!Array.isArray(b)) {
        throw new InternalAssertionTypeError(a, b, path);
      } else if (a.length !== b.length) {
        throw new InternalAssertionError(a, b, path);
      }

      a.forEach((aVal, i) => {
        stackA.push({ a: aVal, path: [...path, i] });
        stackB.push(b[i]);
      });
    } else {
      if (a !== b) {
        throw new InternalAssertionError(a, b, path);
      }
    }
  }
}
