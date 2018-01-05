import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import { NotificationListItem } from '~/components/notifications';

import { api } from '~/data';

const events = api.events;

describe('components/notifications/NotificationListItem', () => {
  const sandbox = sinon.sandbox.create();

  function makeNotificationListItem(event = events.events[386]) {
    return (
      <NotificationListItem
        event={event}
      />
    );
  }

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const wrapper = shallow(
      <NotificationListItem event={events.events[386]} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders unread notification', () => {
    const notification = shallow(makeNotificationListItem(events.events[385]));
    expect(notification.find('.NotificationList-listItem--unread').length).toBe(1);
  });

  it('renders read notification', () => {
    const notification = shallow(makeNotificationListItem());
    expect(notification.find('.NotificationList-listItem--unread').length).toBe(0);
  });
});
