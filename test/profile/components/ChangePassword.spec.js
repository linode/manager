import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangePassword } from '~/profile/components';

import { changeInput, expectRequest, expectDispatchOrStoreErrors } from '@/common';


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

    changeInput(page, 'password', 'thePassword');
    changeInput(page, 'expires', 0);

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile/password', {
        method: 'POST',
        body: { password: 'thePassword' },
      }),
    ]);
  });
});
