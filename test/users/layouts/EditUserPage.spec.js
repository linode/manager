import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import deepFreeze from 'deep-freeze';
import { api } from '@/data';
import { expectRequest } from '@/common';
import { EditUserPage } from '~/users/layouts/EditUserPage';

const { users } = api;

describe('users/layouts/EditUserPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const props = deepFreeze({
    users,
    params: {
      username: 'testuser1',
    },
  });
  it('renders UserForm', async () => {
    const page = shallow(
      <EditUserPage
        dispatch={dispatch}
        {...props}
      />
    );

    expect(page.find('UserForm').length).to.equal(1);
  });
});
