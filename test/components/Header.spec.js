import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { api } from '@/data';
import Header from '../../src/components/Header';

describe('components/Header', () => {
  it('renders username', () => {
    const navigation = shallow(
      <Header
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={api.events}
      />
    );

    expect(navigation.find('.MainHeader-username').text()).to.equal('peanut');
  });

  it('renders gravatar', () => {
    const navigation = shallow(
      <Header
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={api.events}
      />
    );

    expect(navigation.find('.MainHeader-gravatar').props().src)
      .to.equal('https://gravatar.com/avatar/24afd9bad4cf41b3c07d61fa0df03768');
  });

  it('toggles notifications sidebar on profile click', () => {
    const hideShowNotifications = sinon.spy();
    const navigation = shallow(
      <Header
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        hideShowNotifications={hideShowNotifications}
        events={api.events}
      />
    );

    const profileButton = navigation.find('.MainHeader-session');
    profileButton.simulate('click');
    expect(hideShowNotifications.calledOnce).to.equal(true);
  });

  it('displays a bubble with the number of unseen notifications', () => {
    const navigation = shallow(
      <Header
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={api.events}
      />
    );

    expect(navigation.find('.MainHeader-badge').text()).to.equal('2');
  });
});
