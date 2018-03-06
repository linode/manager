import React from 'react';
import { shallow } from 'enzyme';
import { StaticRouter } from 'react-router-dom';
import NotificationListItem from './NotificationListItem';

import { api } from '~/data';

const events = api.events;

describe('components/notifications/NotificationListItem', () => {
  function makeNotificationListItem(event = events.events[386]) {
    return (
      <StaticRouter>
        <NotificationListItem event={event} />
      </StaticRouter>
    );
  }

  it('renders unread notification', () => {
    const wrapper = shallow(makeNotificationListItem(events.events[385]));
    const notification = wrapper.dive().dive();

    expect(notification.find('.NotificationList-listItem--unread').length).toBe(1);
  });

  it('renders read notification', () => {
    const wrapper = shallow(makeNotificationListItem());
    const notification = wrapper.dive();

    expect(notification.find('.NotificationList-listItem--unread').length).toBe(0);
  });
});
