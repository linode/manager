import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { api } from '@/data';

import { IndexPage } from '~/users/layouts/IndexPage';

const { users } = api;

describe('users', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders a list of users', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        users={users}
      />
    );

    const cards = page.find('.Card');
    expect(cards.length).to.equal(users.users.length);
  });

  it('renders a user card', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        users={users}
      />
    );

    const user = users.users[0];
    const firstCard = page.find('.Card').at(0);
    expect(firstCard.find('.user-email').text()).to.equal(user.email);
    expect(firstCard.find('.CardImageHeader-title').text()).to.equal(user.username);
  });
});
