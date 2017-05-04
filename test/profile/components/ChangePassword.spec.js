import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangePassword } from '~/profile/components';

import { expectRequest, expectDispatchOrStoreErrors } from '@/common';


describe('profile/components/ChangePassword', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('changes password', async () => {
    const page = mount(
      <ChangePassword
        dispatch={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find({ id, name: id }).simulate('change', { target: { value, name: id } });

    changeInput('password', 'thePassword');

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      async ([fn]) => await expectRequest(fn, '/account/profile/password', {
        method: 'POST',
        body: { password: 'thePassword' },
      }),
    ]);
  });
});
