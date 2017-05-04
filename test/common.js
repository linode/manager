import { expect } from 'chai';
import sinon from 'sinon';

import * as fetch from '~/fetch';

import { state } from '@/data';


class InternalAssertionError extends Error {
  constructor(aVal, bVal, keyPath) {
    super();
    const keyPathString = `.${keyPath.join('.')}`;
    this.message =
      `Expected 'a' at ${keyPathString} (${JSON.stringify(aVal)} : ${typeof aVal}) ` +
      `to equal 'b' at ${keyPathString} (${JSON.stringify(bVal)} : ${typeof bVal})`;
  }
}

class InternalAssertionTypeError extends Error {
  constructor(aVal, bVal, keyPath) {
    super();
    const keyPathString = `.${keyPath.join('.')}`;
    this.message =
      `Expected type of 'a' at ${keyPathString} (${JSON.stringify(aVal)} : ${typeof aVal}) ` +
      `to equal type of 'b' at ${keyPathString} (${JSON.stringify(bVal)} : ${typeof bVal})`;
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

    if (isObject(a) || isObject(b)) {
      if (!isObject(a) || !isObject(b)) {
        throw new InternalAssertionTypeError(a, b, path);
      }

      Object.keys(a).forEach(aKey => {
        stackA.push({ a: a[aKey], path: [...path, aKey] });
        stackB.push(b[aKey]);
      });

      Object.keys(b).forEach(bKey => {
        if (a[bKey] === undefined) {
          throw new InternalAssertionError(a[bKey], b[bKey], [...path, bKey]);
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

/**
 * Asserts that a certain kind of request occurs when you invoke the provided
 * function.
 * @param {Function} fn - The (async) function to invoke
 * @param {string} path - The path you expect it to be called with
 * @param {Object} expectedRequestData - Data that fetch is expected to be called with
 * @param {Object} response - The data that is returned by the fetch call
 * occured to dispatch
 */
export async function expectRequest(fn, path, expectedRequestData, response) {
  const sandbox = sinon.sandbox.create();
  try {
    expect(fn).to.be.a('function');
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => response || {},
    });
    const dispatch = sinon.spy();
    await fn(dispatch, () => state);
    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[1]).to.equal(path);
    const requestData = fetchStub.firstCall.args[2];

    if (expectedRequestData) {
      Object.keys(expectedRequestData).map(key => {
        const value = requestData[key];
        const nativeValue = key === 'body' ? JSON.parse(value) : value;
        expectObjectDeepEquals(nativeValue, expectedRequestData[key]);
      });
    }
  } finally {
    sandbox.restore();
  }
}

export async function expectDispatchOrStoreErrors(fn, expectArgs) {
  const sandbox = sinon.sandbox.create();
  const dispatch = sinon.spy();

  try {
    fn(dispatch, () => state);

    for (let i = 0; i < dispatch.callCount; i += 1) {
      const nextArgs = dispatch.args[i];
      const nextExpect = expectArgs[i];
      if (nextExpect) {
        await nextExpect(nextArgs);
      }
    }
  } finally {
    sandbox.restore();
  }
}
