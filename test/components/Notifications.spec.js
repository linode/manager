import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { api } from '@/data';
import { makeEvent } from '@/data/events';
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
    expect(notification.find('.Notification--unread').length).to.equal(1);
  });

  it('renders read notifications', () => {
    const notification = shallow(makeNotification());
    expect(notification.find('.Notification--unread').length).to.equal(0);
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

  function testNotificationText(eventType, expectedText) {
    const event = makeEvent(eventType);
    const notification = shallow(makeNotification(event));
    const text = notification.find('.Notification-text').text();
    expect(text).to.contain(expectedText);
  }

  it('renders linode_reboot notification', () => {
    testNotificationText('linode_reboot', 'rebooted');
  });

  it('renders linode_boot notification', () => {
    testNotificationText('linode_boot', 'booted');
  });

  it('renders linode_shutdown notification', () => {
    testNotificationText('linode_shutdown', 'shut down');
  });

  it('renders linode_create notification', () => {
    testNotificationText('linode_create', 'created');
  });

  it('renders linode_delete notification', () => {
    testNotificationText('linode_delete', 'deleted');
  });

  it('renders backups_enable notification', () => {
    testNotificationText('backups_enable', 'enabled');
  });

  it('renders backups_cancel notification', () => {
    testNotificationText('backups_cancel', 'disabled');
  });

  it('renders disk_delete notification', () => {
    testNotificationText('disk_delete', 'deleted');
  });

  it('renders disk_create notification', () => {
    testNotificationText('disk_create', 'created');
  });

  it('renders disk_resize notification', () => {
    testNotificationText('disk_resize', 'resized');
  });

  it('renders empty for unrecognized event type', () => {
    const event = makeEvent('unknown_unrecognized');
    const notification = shallow(makeNotification(event));
    const children = notification.find('.Notification-text').children();
    expect(children.length).to.equal(0);
  });
});


describe('components/Notifications', () => {
  const sandbox = sinon.sandbox.create();

  function makeNotifications(_dispatch = sandbox.spy(),
                             events = api.events,
                             linodes = api.linodes,
                             hideShowNotifications = sandbox.spy(),
                             eventSeen = sandbox.spy()) {
    return (
      <Notifications
        hideShowNotifications={hideShowNotifications}
        events={events}
        linodes={linodes}
        eventSeen={eventSeen}
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
    const count = Object.values(api.events.events).filter(e => !e.seen).length;
    expect(notifications.find('Notification').length).to.equal(count);

    // This event was updated last.
    expect(notifications.find('Notification').at(0).props().id).to.equal(386);
  });

  it('calls eventSeen when opened', () => {
    const notifications = shallow(makeNotifications());
    const eventSeen = sandbox.spy();
    notifications.instance().componentWillUpdate(
      { open: true, events: api.events, eventSeen }, {});
    expect(eventSeen.callCount).to.equal(1);
  });
});
