import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangeEmail } from '~/profile/components';

import { changeInput, expectRequest, expectDispatchOrStoreErrors } from '@/common';
import { profile } from '@/data/profile';


describe('profile/components/ChangeEmail', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('changes email', async () => {
    const dispatch = sandbox.stub();
    const page = mount(
      <ChangeEmail
        dispatch={dispatch}
        email={profile.email}
      />
    );

    changeInput(page, 'email', 'new@gmail.com');

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile', {
        method: 'PUT',
        body: { email: 'new@gmail.com' },
      }),
    ]);
  });
});
