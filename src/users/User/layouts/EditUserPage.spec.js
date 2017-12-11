import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { EditUserPage } from '~/users/user/layouts/EditUserPage';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';
import { testUser } from '~/data/users';


describe('users/user/layouts/EditUserPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(<EditUserPage dispatch={mockDispatch} user={testUser} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should commit changes to the API', async () => {
    const page = mount(
      <EditUserPage
        dispatch={dispatch}
        user={testUser}
      />
    );

    page.find('input[name="username"]')
      .simulate('change', createSimulatedEvent('username', 'the-username'));
    page.find('input[name="email"]')
      .simulate('change', createSimulatedEvent('email', 'the-email'));

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() { } });

    expect(dispatch.callCount).toBe(1);

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/account/users/${testUser.username}`, {
        method: 'PUT',
        body: {
          username: 'the-username',
          email: 'the-email',
          restricted: false,
        },
      }),
    ], 4);
  });
});
