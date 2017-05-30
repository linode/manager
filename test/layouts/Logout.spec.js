import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import { logout } from '~/actions/authentication';
import { LOGIN_ROOT } from '~/constants';
import { Logout } from '~/layouts/Logout';
import * as session from '~/session';

import { expectObjectDeepEquals } from '@/common';


describe('layouts/Logout', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('resets session values on componentDidMount', async () => {
    const dispatch = sandbox.stub();
    sandbox.stub(session, 'redirect');
    const component = shallow(
      <Logout
        dispatch={dispatch}
      />
    );

    await component.instance().componentDidMount();
    expect(dispatch.callCount).to.equal(2);
    expect(dispatch.firstCall.args[0]).to.equal(session.expire);
    expectObjectDeepEquals(dispatch.secondCall.args[0], logout());
  });

  it('redirects to login\'s logout', async () => {
    const dispatch = sandbox.stub();
    const redirect = sandbox.stub(session, 'redirect');
    const component = shallow(
      <Logout
        dispatch={dispatch}
      />
    );

    await component.instance().componentDidMount();
    expect(redirect.args[0][0]).to.equal(`${LOGIN_ROOT}/logout`);
  });
});
