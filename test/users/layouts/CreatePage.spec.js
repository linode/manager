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
      page.find(type).find({ id: name }).simulate('change', { target: { value, name } });

    changeInput('Input', 'username', 'theUser');
    console.log('DEFINITELY FREAKING HERE', 333);
    changeInput('Input', 'email', 'user@example.com');
    console.log('DEFINITELY FREAKING HERE', 2222);
    changeInput('PasswordInput', 'password', 'password');
    console.log('DEFINITELY FREAKING HERE');
    changeInput('Radio', 'restricted', true);

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
