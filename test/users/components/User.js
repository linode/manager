import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';

import User from '~/users/components/User';

import { api } from '@/data';
import { testUser } from '@/data/users';


const { users } = api;

describe('users/components/User', () => {
  it('renders a user card', () => {
    const page = mount(
      <User
        users={users}
        currentUser={testUser}
      />
    );

    const user = users.users[0];
    const firstCard = page.find('.Card').at(0);
    expect(firstCard.find('#email').text()).to.equal(user.email);
    expect(firstCard.find('.CardImageHeader-title').text()).to.equal(user.username);
  });
});
