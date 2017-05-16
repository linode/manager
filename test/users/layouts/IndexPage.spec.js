import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';

import { IndexPage } from '~/users/layouts/IndexPage';

import { api } from '@/data';
import { profile } from '@/data/profile';


const { users } = api;

describe('users/layouts/IndexPage', () => {
  it('renders a list of users', () => {
    const page = mount(
      <IndexPage
        dispatch={() => {}}
        users={users}
        profile={profile}
      />
    );

    const cards = page.find('.Card');
    expect(cards.length).to.equal(users.users.length);
  });
});
