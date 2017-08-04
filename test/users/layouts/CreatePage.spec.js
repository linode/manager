import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { CreatePage } from '~/users/layouts/CreatePage';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';


describe('users/layouts/CreatePage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should commit changes to the API', async () => {
    const page = mount(
      <CreatePage
        dispatch={dispatch}
      />
    );

    dispatch.reset();

    changeInput(page, 'username', 'theUser');
    changeInput(page, 'email', 'user@example.com');
    changeInput(page, 'password', 'password');
    changeInput(page, 'restricted', true);

    await page.find('Form').props().onSubmit();
    const fn = dispatch.firstCall.args[0];

    await expectDispatchOrStoreErrors(fn, [
      ([fn]) => expectRequest(fn, '/account/users/', {
        method: 'POST',
        body: {
          username: 'theUser',
          email: 'user@example.com',
          password: 'password',
          restricted: true,
        },
      }),
    ]);
  });
});
