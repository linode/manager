import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { api } from '@/data';

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
});
