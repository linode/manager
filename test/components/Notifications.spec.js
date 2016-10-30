import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import Notifications from '~/components/Notifications';

describe('components/Notifications', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders hide and logout buttons', () => {
    const notifications = shallow(<Notifications />);
    const header = notifications.find('header');

    expect(header.find({ to: '/logout' }).props().children).to.equal('Logout');
  });

  it('renders the no notifications message', () => {
    const notifications = shallow(<Notifications />);
    expect(notifications.find('h3').text()).to.equal('No new notifications.');
  });

  it('hides the sidebar when the notification overlay is clicked', () => {
    const hideShowNotifications = sandbox.spy();
    const notifications = shallow(<Notifications hideShowNotifications={hideShowNotifications} />);
    const overlay = notifications.find('.notifications-overlay');
    expect(overlay.length).to.equal(1);
    overlay.simulate('click');
    expect(hideShowNotifications.calledOnce).to.equal(true);
  });
});
