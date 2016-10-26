import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { Notifications } from '~/components/Notifications';
import { hideNotifications } from '~/actions/notifications';

describe('components/Notifications', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders hide and logout buttons', () => {
    const notifications = shallow(<Notifications />);
    const header = notifications.find('header');

    expect(header.find('.btn.btn-cancel').text()).to.equal('Hide');
    expect(header.find({ to: '/logout' }).props().children).to.equal('Logout');
  });

  it('renders the no notifications message', () => {
    const notifications = shallow(<Notifications />);
    expect(notifications.find('h3').text()).to.equal('No new notifications.');
  });

  it('hides the sidebar when hide is clicked', () => {
    const dispatch = sandbox.spy();
    const notifications = shallow(<Notifications dispatch={dispatch} />);
    const hide = notifications.find('header .btn.btn-cancel');
    hide.simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0]).to.deep.equal(hideNotifications());
  });

  it('hides the sidebar when the notification overlay is clicked', () => {
    const dispatch = sandbox.spy();
    const notifications = shallow(<Notifications dispatch={dispatch} />);
    const overlay = notifications.find('.notifications-overlay');
    expect(overlay.length).to.equal(1);
    overlay.simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0]).to.deep.equal(hideNotifications());
  });
});
