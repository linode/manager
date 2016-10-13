import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { setToken } from '~/actions/authentication';
import { LOGIN_ROOT } from '~/constants';
import * as fetch from '~/fetch';
import { OAuthCallbackPage } from '../../src/layouts/OAuth';

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
        location={{
          query: { },
        }}
      />);
    await component.instance().componentDidMount();
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(push('/'))).to.equal(true);
  });

  const exchangeResponse = {
    access_token: 'access_token',
    scopes: '*',
    username: 'username',
    email: 'email',
  };

  it('exchanges the code for an OAuth token', async () => {
    const fetchStub = sandbox.stub(fetch, 'rawFetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.stub();
    dispatch.onFirstCall().returns({ scopes: '*', token: 'access_token' });
    const component = shallow(
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
    await component.instance().componentDidMount();
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.calledWith(`${LOGIN_ROOT}/oauth/token`)).to.equal(true);
    // TODO: Figure out how to test FormData, it's weird
  });

  it('handles OAuth redirect errors', async () => {
    const fetchStub = sandbox.stub(fetch, 'rawFetch').returns({
      json: () => exchangeResponse,
    });
    const component = mount(
      <OAuthCallbackPage
        dispatch={() => {}}
        location={{
          query: {
            error: 'yes',
            error_description: 'you done screwed up now',
          },
        }}
      />);
    expect(fetchStub.callCount).to.equal(0);
    expect(component.find('.alert').text()).to.equal('Error: you done screwed up now');
  });

  it('dispatches a setToken action', async () => {
    sandbox.stub(fetch, 'rawFetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.stub();
    dispatch.onFirstCall().returns({ scopes: '*', token: 'access_token' });
    const component = shallow(
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
    await component.instance().componentDidMount();
    expect(dispatch.calledTwice).to.equal(true);
    expect(dispatch.calledWith(
      setToken('access_token', '*', 'username', 'email',
        '0c83f57c786a0b4a39efab23731c7ebc'))).to.equal(true);
    expect(dispatch.calledWith(push('/'))).to.equal(true);
  });

  it('supports the return query string option', async () => {
    sandbox.stub(fetch, 'rawFetch').returns({
      json: () => exchangeResponse,
    });
    const dispatch = sandbox.stub();
    dispatch.onFirstCall().returns({ scopes: '*', token: 'access_token' });
    const component = shallow(
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
    await component.instance().componentDidMount();
    expect(dispatch.calledWith(push('/asdf'))).to.equal(true);
  });
});
