import { Event } from '@linode/api-v4/lib/account';

import { reduxEvent, uniqueEvents } from 'src/__data__/events';

import { ReducerActions, ReducerState, reducer } from './EventsLanding';

const someEvent: Event[] = [
  {
    action: 'linode_boot',
    created: '2018-12-02T20:23:43',
    duration: 0,
    entity: {
      id: 11440645,
      label: 'linode11440645',
      type: 'linode',
      url: '/v4/linode/instances/11440645',
    },
    id: 1234,
    message: null,
    percent_complete: 100,
    rate: null,
    read: false,
    secondary_entity: null,
    seen: true,
    status: 'finished',
    time_remaining: null,
    username: 'test',
  },
];

const currentState: ReducerState = {
  eventsFromRedux: [],
  inProgressEvents: { 123: 50 },
  mostRecentEventTime: 'hello world',
  reactStateEvents: uniqueEvents,
};

const appendPayload: ReducerActions = {
  payload: currentState,
  type: 'append',
};

const prependPayloadNoChange: ReducerActions = {
  payload: currentState,
  type: 'prepend',
};

describe('utility functions', () => {
  it(`should append new events and filter out duplicates to the list of events
   when the "append" type is invoked`, () => {
    expect(reducer(currentState, appendPayload)).toEqual(appendPayload.payload);
    expect(
      reducer(currentState, {
        ...appendPayload,
        payload: {
          ...appendPayload.payload,
          reactStateEvents: [...someEvent, ...someEvent],
        },
      })
    ).toEqual({
      ...currentState,
      reactStateEvents: [...uniqueEvents, ...someEvent],
    });
    expect(reducer(currentState, appendPayload)).not.toEqual({
      ...currentState,
      reactStateEvents: [...uniqueEvents, ...uniqueEvents],
    });
  });

  it('should prepend new events to the list of events and filter out duplicates when the "prepend" type is invoked', () => {
    expect(
      reducer(currentState, {
        ...prependPayloadNoChange,
        payload: {
          ...prependPayloadNoChange.payload,
          eventsFromRedux: [reduxEvent],
          mostRecentEventTime: 'ahhhhhhhh',
        },
      })
    ).toEqual({
      eventsFromRedux: [reduxEvent],
      inProgressEvents: {
        123: 50,
      },
      mostRecentEventTime: 'ahhhhhhhh',
      reactStateEvents: [reduxEvent, ...uniqueEvents],
    });

    expect(
      reducer(currentState, {
        ...prependPayloadNoChange,
        payload: {
          ...prependPayloadNoChange.payload,
          eventsFromRedux: [reduxEvent],
          inProgressEvents: { 123: 70 },
        },
      })
    ).toEqual({
      eventsFromRedux: [reduxEvent],
      inProgressEvents: { 123: 70 },
      mostRecentEventTime: 'hello world',
      reactStateEvents: [reduxEvent, ...uniqueEvents],
    });
  });

  it('should not prepend when inProgress and mostRecentEventTime has changed', () => {
    expect(reducer(currentState, prependPayloadNoChange)).toEqual(currentState);
  });
});
