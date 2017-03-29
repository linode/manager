import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { expectRequest } from '@/common';

import { api } from '@/data';
import { EditUserPage } from '~/users/user/layouts/EditUserPage';

const { users } = api;
const user = { testuser1: users.users[0] };

describe('users/user/layouts/EditUserPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const params = {
    username: 'testuser1',
  };

  it('renders UserForm', () => {
    const page = shallow(
      <EditUserPage
        dispatch={dispatch}
        users={user}
        params={params}
      />
    );

    expect(page.find('UserForm').length).to.equal(1);
  });

  it('should commit changes to the API', async () => {
    const page = shallow(
      <EditUserPage
        dispatch={dispatch}
        users={user}
        params={params}
      />
    );

    dispatch.reset();
    const values = {
      username: 'theUser',
      email: 'user@example.com',
      restricted: false,
    };
    await page.instance().onSubmit(values);
    expect(dispatch.callCount).to.equal(2);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/account/users/${params.username}`, {
        method: 'PUT',
        body: { ...values },
      }
    );
  });
});
