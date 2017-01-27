import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { api } from '@/data';
import { makeEvent } from '@/data/events';

import { NotificationListItem } from '~/components/notifications';

describe('components/Notification', () => {
  const sandbox = sinon.sandbox.create();

  function makeNotificationListItem(event = api.events.events[386]) {
    return (
      <NotificationListItem
        event={event}
      />
    );
  }

  afterEach(() => {
    sandbox.restore();
  });

  it('renders unread notification', () => {
    const notification = shallow(makeNotificationListItem(api.events.events[385]));
    expect(notification.find('.Notification--unread').length).to.equal(1);
  });

  it('renders read notification', () => {
    const notification = shallow(makeNotificationListItem());
    expect(notification.find('.Notification--unread').length).to.equal(0);
  });

  it('marks unread notification as read onclick', () => {
    const readNotification = sandbox.spy();
    const notification = shallow(makeNotificationListItem(
      api.events.events[385], undefined, undefined, readNotification));
    notification.find('.Notification').simulate('click');
    expect(readNotification.callCount).to.equal(1);
    expect(readNotification.args[0][0]).to.equal(385);
  });

  it('marks unread, redirects, and closes pane on view click', () => {
    const readNotification = sandbox.spy();
    const gotoPage = sandbox.spy();
    const hideShowNotifications = sandbox.spy();
    const notification = shallow(makeNotificationListItem(api.events.events[385],
      undefined, gotoPage, readNotification, hideShowNotifications));
    notification.find('.Notification-subject').simulate('click');

    expect(readNotification.callCount).to.equal(1);
    expect(readNotification.args[0][0]).to.equal(385);

    expect(gotoPage.callCount).to.equal(1);
    expect(gotoPage.args[0][0]).to.equal('/linodes/test-linode-3');

    expect(hideShowNotifications.callCount).to.equal(1);
  });

  function testNotificationText(eventType, expectedText) {
    const event = makeEvent(eventType);
    const notification = shallow(makeNotificationListItem(event));
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
    const notification = shallow(makeNotificationListItem(event));
    const children = notification.find('.Notification-text').children();
    expect(children.length).to.equal(0);
  });
});