import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { UserForm } from '~/users/components/UserForm';

describe('users/components/UserForm', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders UserForm', async () => {
    const page = shallow(
      <UserForm
        dispatch={dispatch}
        onSubmit={() => {}}
        username={'Mako'}
        email='username@example.com'
        restricted={true}
        restrictedLabel='checkbox label'
      />
    );

    const username = page.find('#user-username').props().value;
    expect(username).to.equal('Mako');
  });
});
