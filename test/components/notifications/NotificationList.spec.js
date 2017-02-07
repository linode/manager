import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { api } from '@/data';

import { NotificationList, sortEvents } from '~/components/notifications';

describe('components/notifications/NotificationList', () => {
  const sandbox = sinon.sandbox.create();

  function makeNotifications(events = sortEvents(api.events),
                             onClickItem = sandbox.spy(),
                             eventSeen = sandbox.spy()) {
    return (
      <NotificationList
        events={events}
        onClickItem={onClickItem}
        eventSeen={eventSeen}
      />
    );
  }

  afterEach(() => {
    sandbox.restore();
  });

  it('renders events', () => {
    const notifications = mount(makeNotifications());
    const count = Object.values(api.events.events).filter(e => !e.seen).length;
    expect(notifications.find('NotificationListItem').length).to.equal(count);

    // This event was updated last.
    expect(notifications.find('NotificationListItem').at(0).props().event.id).to.equal(385);
  });

  it('calls eventSeen when opened', () => {
    const notifications = mount(makeNotifications());
    const eventSeen = sandbox.spy();
    notifications.instance().componentWillUpdate(
      { open: true, events: sortEvents(api.events), eventSeen }, {});
    expect(eventSeen.callCount).to.equal(1);
  });
});
