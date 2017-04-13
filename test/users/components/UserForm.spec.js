import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { UserForm } from '~/users/components/UserForm';

describe('users/layouts/UserForm', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  const data = {
    username: 'thisUser',
    email: 'user@example.com',
  };

  it('renders data in UserForm', () => {
    const page = shallow(
      <UserForm
        dispatch={dispatch}
        username={data.username}
        email={data.email}
      />
    );

    const username = page.find('#user-username');
    expect(username.props().value).to.equal(data.username);
    const email = page.find('#user-email');
    expect(email.props().value).to.equal(data.email);
  });
});
