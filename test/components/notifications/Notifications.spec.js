import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { Notifications } from '~/components/notifications/Notifications';

import { api, fakeAPI } from '@/data';
import { seenEvent } from '@/data/events';

const events = api.events;

describe('components/Notifications', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch;
  let notifications;

  beforeEach(() => {
    dispatch = sandbox.spy();
    notifications = shallow(<Notifications dispatch={dispatch} events={events} />);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('defines default state', () => {
    expect(notifications.instance().state).to.exist;
    expect(notifications.instance().state.loadingMore).to.equal(false);
    expect(notifications.instance()._pollingTimeoutId).to.be.null;
  });

  it('disables polling on unmount', () => {
    notifications.instance().componentWillUnmount();
    expect(notifications.instance()._pollingTimeoutId).to.equal(null);
  });

  it('implements fetching an events page', () => {
    expect(notifications.instance().fetchEventsPage).to.exist;

    notifications.instance().fetchEventsPage();

    expect(dispatch.callCount).to.equal(1);
  });

  it('implements fetching all events', () => {
    expect(notifications.instance().fetchAllEvents).to.exist;

    notifications.instance().fetchAllEvents();

    expect(dispatch.callCount).to.equal(1);
  });

  it('implements making events seen', () => {
    const emptyEventsAPI = fakeAPI([
      [{}, 'event', 'events']
    ]);
    notifications = shallow(<Notifications dispatch={dispatch} events={emptyEventsAPI.events} />);
    expect(notifications.instance().markEventsSeen).to.exist;

    notifications.instance().markEventsSeen();

    expect(dispatch.callCount).to.equal(0);
  });

  it('only marks unseen events seen', () => {
    const seenEventsAPI = fakeAPI([
      [
        {
          [seenEvent.id]: seenEvent
        },
        'event',
        'events'
      ]
    ]);
    notifications = shallow(<Notifications dispatch={dispatch} events={seenEventsAPI.events} />);
    expect(notifications.instance().markEventsSeen).to.exist;

    notifications.instance().markEventsSeen();

    expect(dispatch.callCount).to.equal(0);
  });

  it('marks events seen for all unseen events', () => {
    expect(notifications.instance().markEventsSeen).to.exist;

    notifications.instance().markEventsSeen();

    expect(dispatch.callCount).to.equal(1);
  });
});
