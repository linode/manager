import { mount } from 'enzyme';
import sinon from 'sinon';

import { AddUser } from '~/users/components';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';

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

    modal.find('input[name="username"]')
      .simulate('change', createSimulatedEvent('username', 'theUser'));

    modal.find('input[name="email"]')
      .simulate('change', createSimulatedEvent('email', 'user@example.com'));

    modal.find('input#restricted')
      .simulate('click');

    await modal.find('Form').props().onSubmit();
    const fn = dispatch.firstCall.args[0];

    await expectDispatchOrStoreErrors(fn, [
      ([fn]) => expectRequest(fn, '/account/users/', {
        method: 'POST',
        body: {
          username: 'theUser',
          email: 'user@example.com',
          restricted: true,
        },
      }),
    ]);
  });
});
