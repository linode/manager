import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import UserForm from '~/users/components/UserForm';

import { testUser } from '~/data/users';


describe('users/layouts/UserForm', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <UserForm
        dispatch={mockDispatch}
        user={testUser}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders data in UserForm', () => {
    const page = shallow(
      <UserForm
        dispatch={dispatch}
        user={testUser}
      />
    );

    const username = page.find('#username');
    expect(username.props().value).toBe(testUser.username);
    const email = page.find('#email');
    expect(email.props().value).toBe(testUser.email);
  });
});
