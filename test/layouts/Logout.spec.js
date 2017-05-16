import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import { Logout } from '../../src/layouts/Logout';
import { logout } from '~/actions/authentication';
import { LOGIN_ROOT } from '~/constants';
import * as storage from '~/storage';
import { setToken } from '~/actions/authentication';

describe('layouts/Logout', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('resets session values on componentDidMount', async () => {
    const dispatch = sandbox.spy();
    const redirect = sandbox.spy();
    const setStorage = sandbox.spy(storage, 'setStorage');
    const component = shallow(
      <Logout
        dispatch={dispatch}
        redirect={redirect}
      />
    );
    await component.instance().componentDidMount();
    dispatch.firstCall.args[0](dispatch);
    expect(dispatch.callCount).to.equal(3);
    expect(dispatch.thirdCall.args[0]).to.deep.equal(setToken('', '', '', '', ''));
    expect(dispatch.secondCall.args[0]).to.deep.equal(logout());

    const sessionValues = [
      'authentication/oauth-token',
      'authentication/scopes',
    ];

    expect(setStorage.callCount).to.equal(sessionValues.length);
    sessionValues.map((name, i) => {
      expect(setStorage.args[i][0]).to.equal(name);
      expect(setStorage.args[i][1]).to.equal('');
    });
  });

  it('redirects to login\'s logout', async () => {
    const dispatch = sandbox.spy();
    const redirect = sandbox.spy();
    const component = shallow(
      <Logout
        dispatch={dispatch}
        redirect={redirect}
      />
    );

    await component.instance().componentDidMount();
    expect(redirect.args[0][0]).to.equal(`${LOGIN_ROOT}/logout`);
  });
});
