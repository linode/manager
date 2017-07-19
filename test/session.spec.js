import { expect } from 'chai';
import sinon from 'sinon';

import { store } from '~/store';
import * as session from '~/session';
import * as storage from '~/storage';


describe('session', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('allows the request when logged out and hitting /oauth/callback', () => {
    const redirectStub = sandbox.stub(session, 'redirect');
    sandbox.stub(store, 'getState', () =>
      ({ authentication: { token: null } }));

    session.checkLogin({ location: { pathname: '/oauth/callback' } });

    expect(redirectStub.callCount).to.equal(0);
  });

  it('allows the request when the oauth token is not null', () => {
    const redirectStub = sandbox.stub(session, 'redirect');
    sandbox.stub(store, 'getState', () =>
      ({ authentication: { token: 'not null' } }));

    session.checkLogin({ location: { pathname: '/' } });

    expect(redirectStub.callCount).to.equal(0);
  });

  it('redirects to login when the oauth token is null', () => {
    const redirectStub = sandbox.stub(session, 'redirect');
    sandbox.stub(store, 'getState', () =>
      ({ authentication: { token: null } }));

    session.checkLogin({ location: { pathname: '/linodes', query: { foo: 'bar' } } });

    expect(redirectStub.callCount).to.equal(1);
    expect(redirectStub.args[0][0]).to.equal(
      session.loginAuthorizePath('%2Flinodes%253Ffoo%3Dbar'));
  });

  it('removes localstorage endpoint on expire', () => {
    const setStorage = sandbox.stub(storage, 'setStorage');
    sandbox.stub(session, 'redirect');
    const dispatch = sandbox.stub();

    session.expire(dispatch);

    const sessionValues = [
      'authentication/oauth-token',
      'authentication/scopes',
      'authentication/expires',
    ];

    expect(setStorage.callCount).to.equal(sessionValues.length);
    sessionValues.map((name, i) => {
      expect(setStorage.args[i][0]).to.equal(name);
      expect(setStorage.args[i][1]).to.equal('');
    });
  });

  it('expires and checksLogin on expireAndReAuth', () => {
    const redirectStub = sandbox.stub(session, 'redirect');
    const dispatch = sandbox.stub();

    session.expireAndReAuth(dispatch);

    expect(dispatch.firstCall.args[0]).to.equal(session.expire);
    expect(redirectStub.callCount).to.equal(1);
    expect(redirectStub.args[0][0]).to.equal(
      session.loginAuthorizePath('%2Fcontext.html'));
  });
});
