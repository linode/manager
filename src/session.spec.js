import sinon from 'sinon';

import * as session from '~/session';
import * as storage from '~/storage';


describe('session', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('removes localstorage endpoint on expire', () => {
    const setStorage = sandbox.stub(storage, 'setStorage');
    const dispatch = sandbox.stub();

    session.expire(dispatch);

    const sessionValues = [
      'authentication/oauth-token',
      'authentication/scopes',
      'authentication/expires',
    ];

    expect(setStorage.callCount).toBe(sessionValues.length);
    sessionValues.map((name, i) => {
      expect(setStorage.args[i][0]).toBe(name);
      expect(setStorage.args[i][1]).toBe('');
    });
  });

  /**
   * @todo skipped
   * Not providing value.
   */
  it.skip('expires and checksLogin on expireAndReAuth', () => {
    const redirectStub = sandbox.stub(session, 'redirect');
    const dispatch = sandbox.stub();

    session.expireAndReAuth(dispatch);

    expect(dispatch.firstCall.args[0]).toBe(session.expire);
    expect(redirectStub.callCount).toBe(1);
    expect(redirectStub.args[0][0]).toBe(
      session.loginAuthorizePath('%2Fcontext.html'));
  });
});
