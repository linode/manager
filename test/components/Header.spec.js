import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import Header from '~/components/Header';
import { api, fakeAPI } from '@/data';
import { testEvent, seenEvent } from '@/data/events';

const events = api.events;

describe('components/Header', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  beforeEach(() => {
    sandbox.reset();
  });

  it('renders username', () => {
    const header = shallow(
      <Header
        dispatch={dispatch}
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={events}
        notifications={{ open: false }}
        account={{ open: false }}
        session={{ open: false }}
      />
    );

    expect(header.find('.MainHeader-username').text()).to.equal('peanut');
  });

  it('renders gravatar', () => {
    const header = shallow(
      <Header
        dispatch={dispatch}
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={events}
        notifications={{ open: false }}
        account={{ open: false }}
        session={{ open: false }}
      />
    );

    expect(header.find('.MainHeader-gravatar').props().src)
      .to.equal('https://gravatar.com/avatar/24afd9bad4cf41b3c07d61fa0df03768');
  });

  it('implements making events seen', () => {
    const emptyEventsAPI = fakeAPI([
      [{}, 'event', 'events'],
    ]);
    const header = shallow(
      <Header
        dispatch={dispatch}
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={emptyEventsAPI.events}
        notifications={{ open: false }}
        account={{ open: false }}
        session={{ open: false }}
      />
    );
    expect(header.instance().markEventsSeen).to.exist;

    header.instance().markEventsSeen();

    expect(dispatch.callCount).to.equal(0);
  });

  it('only marks unseen events seen', () => {
    const seenEventsAPI = fakeAPI([
      [
        {
          [seenEvent.id]: seenEvent,
        },
        'event',
        'events',
      ],
    ]);
    const header = shallow(
      <Header
        dispatch={dispatch}
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={seenEventsAPI.events}
        notifications={{ open: false }}
        session={{ open: false }}
      />
    );
    expect(header.instance().markEventsSeen).to.exist;

    dispatch.reset();
    header.instance().markEventsSeen();

    expect(dispatch.callCount).to.equal(0);
  });

  it('marks events seen for all unseen events', () => {
    const seenEventsAPI = fakeAPI([
      [
        {
          [testEvent.id]: testEvent,
        },
        'event',
        'events',
      ],
    ]);
    const header = shallow(
      <Header
        dispatch={dispatch}
        username="peanut"
        emailHash="24afd9bad4cf41b3c07d61fa0df03768"
        events={seenEventsAPI.events}
        notifications={{ open: false }}
        session={{ open: false }}
      />
    );
    expect(header.instance().markEventsSeen).to.exist;

    header.instance().markEventsSeen();

    expect(dispatch.callCount).to.equal(1);
  });
});
