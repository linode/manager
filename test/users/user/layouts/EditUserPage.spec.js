import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { EditUserPage } from '~/users/user/layouts/EditUserPage';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testUser } from '@/data/users';


describe('users/user/layouts/EditUserPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should commit changes to the API', async () => {
    const page = mount(
      <EditUserPage
        dispatch={dispatch}
        user={testUser}
      />
    );

    const changeInput = (id, value) =>
      page.find({ id, name: id }).simulate('change', { target: { value, name: id } });

    changeInput('username', 'the-username');
    changeInput('email', 'the-email');

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/account/users/${testUser.username}`, {
        method: 'PUT',
        body: {
          username: 'the-username',
          email: 'the-email',
          restricted: false,
        },
      }),
    ], 3);
  });
});
