import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { Notifications } from '~/components/notifications/Notifications';

import { api } from '@/data';


const events = api.events;

describe('components/notifications/Notifications', function () {
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
  });

  it('implements fetching an events page', () => {
    expect(notifications.instance().fetchEventsPage).to.exist;

    notifications.instance().fetchEventsPage();

    expect(dispatch.callCount).to.equal(1);
  });

  it('implements fetching all events', () => {
    expect(notifications.instance().fetchAllEvents).to.exist;

    notifications.instance().fetchAllEvents()(dispatch);

    expect(dispatch.callCount).to.equal(1);
  });
});
