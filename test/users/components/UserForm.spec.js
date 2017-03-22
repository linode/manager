import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { UserForm } from '~/users/components/UserForm';

describe('users/components/UserForm', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const user = {
    username: 'Mako',
    email: 'username@example.com',
  };

  it('renders UserForm', () => {
    const page = shallow(
      <UserForm
        dispatch={dispatch}
        onSubmit={() => {}}
        username={user.username}
        email={user.email}
      />
    );

    const username = page.find('#user-username').props().value;
    expect(username).to.equal(user.username);
    const email = page.find('#user-email').props().value;
    expect(email).to.equal(user.email);
  });
});
