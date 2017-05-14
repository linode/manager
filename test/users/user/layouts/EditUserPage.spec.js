import { expect } from 'chai';
import { shallow } from 'enzyme';
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

  it('renders UserForm', () => {
    const page = shallow(
      <EditUserPage
        dispatch={dispatch}
        user={testUser}
      />
    );

    expect(page.find('UserForm').length).to.equal(1);
  });

  it('should commit changes to the API', async () => {
    const page = shallow(
      <EditUserPage
        dispatch={dispatch}
        user={testUser}
      />
    );

    dispatch.reset();
    const values = {
      username: 'theUser',
      email: 'user@example.com',
      restricted: false,
    };
    await page.instance().onSubmit();
    expect(dispatch.callCount).to.equal(1);

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/account/users/${testUser.username}`, {
        method: 'PUT',
        body: { ...values },
      }),
    ], 3);
  });
});
