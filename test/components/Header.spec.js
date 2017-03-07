import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import Header from '../../src/components/Header';

const events = api.events;

describe('components/Header', () => {
  it('renders username', () => {
    const navigation = shallow(
      <Header
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={events}
      />
    );

    expect(navigation.find('.MainHeader-username').text()).to.equal('peanut');
  });

  it('renders gravatar', () => {
    const navigation = shallow(
      <Header
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={events}
      />
    );

    expect(navigation.find('.MainHeader-gravatar').props().src)
      .to.equal('https://gravatar.com/avatar/24afd9bad4cf41b3c07d61fa0df03768');
  });
});
