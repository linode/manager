import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangePassword } from '~/profile/components';

import { expectRequest } from '@/common';


describe('profile/components/ChangePassword', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('changes password', async () => {
    const page = shallow(
      <ChangePassword
        dispatch={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find({ id, name: id }).props().onChange({ target: { value, name: id } });

    changeInput('password', 'thePassword');

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile/password', {
      method: 'POST',
      body: { password: 'thePassword' },
    });
  });

  it('renders two factor', async () => {
    const page = shallow(
      <AuthenticationPage
        dispatch={dispatch}
      />
    );

    expect(page.find('TwoFactorPanel').length).to.equal(1);
  });
});
