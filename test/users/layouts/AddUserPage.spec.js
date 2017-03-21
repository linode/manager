import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { AddUserPage } from '~/users/layouts/AddUserPage';

describe('users/layouts/AddUserPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders UserForm', async () => {
    const page = shallow(
      <AddUserPage
        dispatch={dispatch}
      />
    );

    expect(page.find('UserForm').length).to.equal(1);
  });
});
