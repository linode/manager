import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { api } from '@/data';
// import { makeEvent } from '@/data/events';

import { NotificationListItem } from '~/components/notifications';

describe('components/notifications/NotificationListItem', () => {
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
    expect(notification.find('.NotificationList-listItem--unread').length).to.equal(1);
  });

  it('renders read notification', () => {
    const notification = shallow(makeNotificationListItem());
    expect(notification.find('.NotificationList-listItem--unread').length).to.equal(0);
  });

  // it('marks unread notification as read onclick', () => {
  //   const readNotification = sandbox.spy();
  //   const notification = shallow(makeNotificationListItem(
  //     api.events.events[385], undefined, undefined, readNotification));
  //   notification.find('.Notification').simulate('click');
  //   expect(readNotification.callCount).to.equal(1);
  //   expect(readNotification.args[0][0]).to.equal(385);
  // });
  //
  // it('marks unread, redirects, and closes pane on view click', () => {
  //   const readNotification = sandbox.spy();
  //   const gotoPage = sandbox.spy();
  //   const hideShowNotifications = sandbox.spy();
  //   const notification = shallow(makeNotificationListItem(api.events.events[385],
  //     undefined, gotoPage, readNotification, hideShowNotifications));
  //   notification.find('.Notification-subject').simulate('click');
  //
  //   expect(readNotification.callCount).to.equal(1);
  //   expect(readNotification.args[0][0]).to.equal(385);
  //
  //   expect(gotoPage.callCount).to.equal(1);
  //   expect(gotoPage.args[0][0]).to.equal('/linodes/test-linode-3');
  //
  //   expect(hideShowNotifications.callCount).to.equal(1);
  // });
});
