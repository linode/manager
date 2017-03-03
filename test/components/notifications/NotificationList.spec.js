import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { NotificationList } from '~/components/notifications';

import { api } from '@/data';

const events = api.events;


describe('components/notifications/NotificationList', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders events', () => {
    const notifications = mount(<NotificationList events={events} />);
    const count = Object.values(events.events).filter(e => !e.seen).length;

    expect(notifications.find('NotificationListItem').length).to.equal(count);

    // This event was updated last.
    expect(notifications.find('NotificationListItem').at(0).props().event.id).to.equal(385);
  });

  it('should show a loading message when flag is set', () => {
    const notifications = mount(
      <NotificationList
        events={events}
        loading
      />
    );

    expect(notifications.find('.LoadingMessage').length).to.equal(1);
  });
});
