import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { CreatePage } from '~/users/layouts/CreatePage';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';


describe('users/layouts/CreatePage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should commit changes to the API', async () => {
    const page = shallow(
      <CreatePage
        dispatch={dispatch}
      />
    );

    dispatch.reset();

    const changeInput = (type, name, value) =>
      page.find(type).find({ name }).simulate('change', { target: { value, name } });

    changeInput('Input', 'username', 'theUser');
    changeInput('Input', 'email', 'user@example.com');
    changeInput('Input', 'password', 'password');
    changeInput('input[type="radio"]', 'restricted', true);

    await page.find('Form').simulate('submit');
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
