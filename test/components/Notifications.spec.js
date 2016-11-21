import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { api } from '@/data';
import Notifications, { Notification } from '~/components/Notifications';

describe('components/Notification', () => {
  const sandbox = sinon.sandbox.create();

  function makeNotification(event = api.events.events[386],
                            linodes = api.linodes,
                            gotoPage = sandbox.spy(),
                            readNotification = sandbox.spy()) {
    return (
      <Notification
        {...event}
        linodes={linodes}
        readNotification={readNotification}
        gotoPage={gotoPage}
      />
    );
  }

  afterEach(() => {
    sandbox.restore();
  });

  it('renders unread notification', () => {
    const notification = shallow(makeNotification(api.events.events[385]));
    expect(notification.find('.Notification--unseen').length).to.equal(1);
  });

  it('renders read notifications', () => {
    const notification = shallow(makeNotification());
    expect(notification.find('.Notification--unseen').length).to.equal(0);
  });

  it('marks unread notification as read onclick', () => {
    const readNotification = sandbox.spy();
    const notification = shallow(makeNotification(
      api.events.events[385], undefined, undefined, readNotification));
    notification.find('.Notification').simulate('click');
    expect(readNotification.calledOnce).to.equal(true);
    expect(readNotification.args[0][0]).to.equal(385);
  });

  it('calls gotoPage on read notification onclick', () => {
    const gotoPage = sandbox.spy();
    const notification = shallow(makeNotification(
      undefined, undefined, gotoPage));
    notification.find('.Notification').simulate('click');
    expect(gotoPage.calledOnce).to.equal(true);
    expect(gotoPage.args[0][0]).to.equal(`/linodes/${api.events.events[386].linode_id}`);
  });
});


describe('components/Notifications', () => {
  const sandbox = sinon.sandbox.create();

  function makeNotifications(_dispatch = sandbox.spy(),
                             events = api.events,
                             linodes = api.linodes,
                             hideShowNotifications = sandbox.spy()) {
    return (
      <Notifications
        hideShowNotifications={hideShowNotifications}
        events={events}
        linodes={linodes}
      />
    );
  }

  afterEach(() => {
    sandbox.restore();
  });

  it('hides the sidebar when the notification overlay is clicked', () => {
    const hideShowNotifications = sandbox.spy();
    const notifications = shallow(makeNotifications(
      undefined, undefined, undefined, hideShowNotifications));
    const overlay = notifications.find('.Notifications-overlay');
    expect(overlay.length).to.equal(1);
    overlay.simulate('click');
    expect(hideShowNotifications.calledOnce).to.equal(true);
  });

  it('renders events and in updated order', () => {
    const notifications = shallow(makeNotifications());
    expect(notifications.find('Notification').length).to.equal(2);

    // This event was updated last.
    expect(notifications.find('Notification').at(0).props().id).to.equal(386);
  });
});
