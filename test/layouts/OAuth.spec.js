import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { setToken } from '~/actions/authentication';
import { LOGIN_ROOT } from '~/constants';
import { OAuthCallbackPage } from '~/layouts/OAuth';
import * as fetch from '~/fetch';

import { expectObjectDeepEquals } from '@/common';


describe('layouts/OAuth', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('redirects to / when no code is provided', async () => {
    const dispatch = sandbox.spy();
    const component = shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{ query: { } }}
      />);

    dispatch.reset();
    await component.instance().componentDidMount();
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.calledWith(push('/'))).to.equal(true);
  });

  const exchangeResponse = {
    access_token: 'access_token',
    scopes: '*',
  };

  it('exchanges the code for an OAuth token', async () => {
    const fetchStub = sandbox.stub(fetch, 'rawFetch').returns({
      json: () => exchangeResponse,
    });

    const component = shallow(
      <OAuthCallbackPage
        dispatch={() => ({ timezone: '' })}
        location={{
          query: {
            code: 'code',
          },
        }}
      />);

    fetchStub.resetHistory();
    await component.instance().componentDidMount();
    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.calledWith(`${LOGIN_ROOT}/oauth/token`)).to.equal(true);
    // TODO: Figure out how to test FormData, it's weird
  });

  it('dispatches a setToken action', async () => {
    sandbox.stub(fetch, 'rawFetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.stub();
    dispatch.returns({ timezone: '' });

    const component = shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: {
            code: 'code',
          },
        }}
      />);

    dispatch.resetHistory();
    await component.instance().componentDidMount();
    dispatch.firstCall.args[0](dispatch);
    expect(dispatch.callCount).to.equal(3);
    expectObjectDeepEquals(dispatch.thirdCall.args[0], setToken('access_token', '*'));
    expectObjectDeepEquals(dispatch.secondCall.args[0], push('/'));
  });

  it('supports the return query string option', async () => {
    sandbox.stub(fetch, 'rawFetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.stub();
    dispatch.returns({ timezone: '' });

    const component = shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: {
            code: 'code',
            return: '/asdf',
          },
        }}
      />);
    await component.instance().componentDidMount();
    expect(dispatch.calledWith(push('/asdf'))).to.equal(true);
  });
});
