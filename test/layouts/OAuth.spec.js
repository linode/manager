import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { OAuthCallbackPage } from '../../src/layouts/OAuth';
import { pushPath } from 'redux-simple-router';
import { setToken } from '~/actions/authentication';
import { LOGIN_ROOT } from '~/constants';
import * as fetch from '~/fetch';

describe('layouts/OAuth', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const componentDidMount = OAuthCallbackPage.prototype.componentDidMount;
  OAuthCallbackPage.prototype.componentDidMount = () => {};

  it('redirects to / when no code is provided', async () => {
    const dispatch = sandbox.spy();
    const component = (
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: { },
        }}
      />);
    await componentDidMount.call(component);
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(pushPath('/'))).to.equal(true);
  });

  const exchangeResponse = {
    access_token: 'access_token',
    scopes: '*',
    username: 'username',
    email: 'email',
  };

  it('exchanges the code for an OAuth token', async () => {
    const fetchStub = sandbox.stub(fetch, '_fetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.spy();
    const component = (
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: {
            username: 'username',
            email: 'email',
            code: 'code',
          },
        }}
      />);
    await componentDidMount.call(component);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.calledWith(`${LOGIN_ROOT}/oauth/token`)).to.equal(true);
    // TODO: Figure out how to test FormData, it's weird
  });

  it('dispatches a setToken action', async () => {
    sandbox.stub(fetch, '_fetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.spy();
    const component = (
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: {
            username: 'username',
            email: 'email',
            code: 'code',
          },
        }}
      />);
    await componentDidMount.call(component);
    expect(dispatch.calledTwice).to.equal(true);
    expect(dispatch.calledWith(
      setToken('access_token', '*', 'username', 'email'))).to.equal(true);
    expect(dispatch.calledWith(pushPath('/'))).to.equal(true);
  });

  it('supports the return query string option', async () => {
    sandbox.stub(fetch, '_fetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.spy();
    const component = (
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: {
            username: 'username',
            email: 'email',
            code: 'code',
            return: '/asdf',
          },
        }}
      />);
    await componentDidMount.call(component);
    expect(dispatch.calledWith(pushPath('/asdf'))).to.equal(true);
  });
});
