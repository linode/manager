import _ from 'lodash';
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

export function expectObjectDeepEquals(initialA, initialB, initialPath) {
  const stackA = [{ a: initialA, path: [initialPath].filter(Boolean) }];
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
        if (a[bKey] === undefined && b[bKey] !== undefined) {
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
export async function expectRequest(fn, path, expectedRequestData, response = {},
                                    fetchStub = null) {
  const sandbox = sinon.sandbox.create();
  try {
    expect(fn).to.be.a('function');

    if (!fetchStub) {
      // eslint-disable-next-line no-param-reassign
      fetchStub = sandbox.stub(fetch, 'fetch').returns({
        json: () => response,
      });
    }

    const dispatch = sandbox.stub();
    dispatch.returns(response);
    await fn(dispatch, () => state);

    // This covers the set of API calls that use the thunkFetch helper to make requests.
    if (_.isFunction(dispatch.firstCall && dispatch.firstCall.args[0])) {
      const _dispatch = sandbox.stub();
      _dispatch.returns(response);
      await dispatch.firstCall.args[0](_dispatch, () => state);
      if (_dispatch.callCount === 1) {
        return expectRequest(
          _dispatch.firstCall.args[0], path, expectedRequestData, response, fetchStub);
      }

      return;
    }

    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[1]).to.equal(path);

    const requestData = fetchStub.firstCall.args[2];

    if (expectedRequestData) {
      Object.keys(expectedRequestData).map(key => {
        const value = requestData[key];
        const nativeValue = key === 'body' ? JSON.parse(value) : value;
        expectObjectDeepEquals(nativeValue, expectedRequestData[key], key);
      });
    }
  } finally {
    sandbox.restore();
  }
}

export async function expectDispatchOrStoreErrors(fn,
                                                  expectArgs = [],
                                                  expectN = undefined,
                                                  dispatchResults = []) {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  try {
    for (let i = 0; i < dispatchResults.length; i += 1) {
      dispatch.onCall(i).returns(dispatchResults[i]);
    }

    await fn(dispatch, () => state);

    if (expectN !== undefined) {
      expect(expectN).to.equal(dispatch.callCount);
    }

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

export function changeInput(component, idName, value, options = {}) {
  const selector = { name: idName };

  try {
    let input = component;

    if (!options.nameOnly) {
      selector.id = idName;
    }

    if (options.displayName) {
      input = input.find(options.displayName);
    }

    input = input.find(selector);

    if (input.length > 1 && input.at(0).props().type === 'radio') {
      input = input.at(0);
    }

    // Work-around for testing the Select component with multiple values.
    if (Array.isArray(value)) {
      input.props().onChange(value.map(value => ({ target: { value, name: idName } })));
      return;
    }

    const event = { target: { value, name: idName, checked: value } };

    if (input.length === 0 && options.displayName) {
      const selectorsMatch = (props) =>
        Object.values(selector).reduce(
          (field, matched) => matched && props[field] === selector[field], false);
      const componentWithSelectorAttributes = component.findWhere(
        o => o.name() === options.displayName && selectorsMatch(o.props()));
      componentWithSelectorAttributes.props().onChange(event);
      return;
    }

    input.simulate('change', event);
  } catch (e) {
    const eWithMoreInfo = e;
    eWithMoreInfo.message = `${e.message}: ${JSON.stringify(selector)}`;
    throw eWithMoreInfo;
  }
}
