import { mount } from 'enzyme';
import sinon from 'sinon';

import { AddUser } from '~/users/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';


describe('users/components/AddUser', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should commit changes to the API', async () => {
    AddUser.trigger(dispatch);
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();

    changeInput(modal, 'username', 'theUser');
    changeInput(modal, 'email', 'user@example.com');
    changeInput(modal, 'password', 'password');
    changeInput(modal, 'restricted', true);

    await modal.find('Form').props().onSubmit();
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
