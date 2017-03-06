import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { NotificationList } from '~/components/notifications';

import { api, fakeAPI } from '@/data';
import { events } from '@/data/events';


// NOTE: item click handling untested because of <Link> usage
describe('components/notifications/NotificationList', () => {
  const sandbox = sinon.sandbox.create();
  let notificationList;

  beforeEach(() => {
    notificationList = mount(<NotificationList events={api.events} />);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('implements default state', () => {
      expect(notificationList.instance().state).to.exist;
      expect(notificationList.instance().state.totalResults).to.equal(4);
  });

  it('updates total results based on events results', () => {
    let eventsAPI = fakeAPI([[events, 'event', 'events', 200]]);
    notificationList = mount(
      <NotificationList
        events={eventsAPI.events}
      />
    );
    expect(notificationList.instance().state.totalResults).to.equal(200);

    eventsAPI = fakeAPI([[events, 'event', 'events', 250]]);
    notificationList.instance().updateTotalResults(eventsAPI.events);

    expect(notificationList.instance().state.totalResults).to.equal(250);
  });

  it('updates total results but also retains the max number of results seen', () => {
    let eventsAPI = fakeAPI([[events, 'event', 'events', 200]]);
    notificationList = mount(
      <NotificationList
        events={eventsAPI.events}
      />
    );
    expect(notificationList.instance().state.totalResults).to.equal(200);

    eventsAPI = fakeAPI([[events, 'event', 'events', 100]]); // less total
    notificationList.instance().updateTotalResults(eventsAPI.events);

    expect(notificationList.instance().state.totalResults).to.equal(200);
  });

  it('renders events', () => {
    const notifications = mount(<NotificationList events={api.events} />);
    const count = Object.values(api.events.events).filter(e => !e.seen).length;

    expect(notifications.find('NotificationListItem').length).to.equal(count);

    // This event was updated last.
    expect(notifications.find('NotificationListItem').at(0).props().event.id).to.equal(385);
  });


  it('renders a show more link when more results are available', () => {
    const eventsAPI = fakeAPI([
      [events, 'event', 'events', 200]
    ]);
    notificationList = mount(
      <NotificationList
        events={eventsAPI.events}
      />
    );

    expect(notificationList.find('.ShowMoreLink').length).to.equal(1);
  });

  it('supports show more click handling', () => {
    const clickShowMoreHandlerSpy = sandbox.spy();
    const eventsAPI = fakeAPI([
      [events, 'event', 'events', 200]
    ]);
    notificationList = mount(
      <NotificationList
        events={eventsAPI.events}
        onClickShowMore={clickShowMoreHandlerSpy}
      />
    );

    notificationList.find('.ShowMoreLink').first().simulate('click');

    expect(clickShowMoreHandlerSpy.callCount).to.equal(1);
  });

  it('should show a loading message when flag is set', () => {
    const notifications = mount(
      <NotificationList
        events={api.events}
        loading
      />
    );

    expect(notifications.find('.LoadingMessage').length).to.equal(1);
  });
});
