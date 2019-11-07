import { Event } from 'linode-js-sdk/lib/account';
import { reduxEvent, uniqueEvents } from 'src/__data__/events';
import { reducer, ReducerActions, ReducerState } from './EventsLanding';

const someEvent: Event[] = [
  {
    id: 1234,
    time_remaining: 50,
    secondary_entity: null,
    seen: true,
    created: '2018-12-02T20:23:43',
    action: 'linode_boot',
    read: false,
    percent_complete: 100,
    username: 'test',
    rate: null,
    entity: {
      id: 11440645,
      label: 'linode11440645',
      type: 'linode',
      url: '/v4/linode/instances/11440645'
    },
    status: 'finished'
  }
];

const currentState: ReducerState = {
  reactStateEvents: uniqueEvents,
  eventsFromRedux: [],
  inProgressEvents: { 123: 50 },
  mostRecentEventTime: 'hello world'
};

const appendPayload: ReducerActions = {
  type: 'append',
  payload: currentState
};

const prependPayloadNoChange: ReducerActions = {
  type: 'prepend',
  payload: currentState
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
          reactStateEvents: [...someEvent, ...someEvent]
        }
      })
    ).toEqual({
      ...currentState,
      reactStateEvents: [...uniqueEvents, ...someEvent]
    });
    expect(reducer(currentState, appendPayload)).not.toEqual({
      ...currentState,
      reactStateEvents: [...uniqueEvents, ...uniqueEvents]
    });
  });

  it('should prepend new events to the list of events and filter out duplicates when the "prepend" type is invoked', () => {
    expect(
      reducer(currentState, {
        ...prependPayloadNoChange,
        payload: {
          ...prependPayloadNoChange.payload,
          mostRecentEventTime: 'ahhhhhhhh',
          eventsFromRedux: [reduxEvent]
        }
      })
    ).toEqual({
      reactStateEvents: [reduxEvent, ...uniqueEvents],
      eventsFromRedux: [reduxEvent],
      inProgressEvents: {
        123: 50
      },
      mostRecentEventTime: 'ahhhhhhhh'
    });

    expect(
      reducer(currentState, {
        ...prependPayloadNoChange,
        payload: {
          ...prependPayloadNoChange.payload,
          inProgressEvents: { 123: 70 },
          eventsFromRedux: [reduxEvent]
        }
      })
    ).toEqual({
      reactStateEvents: [reduxEvent, ...uniqueEvents],
      eventsFromRedux: [reduxEvent],
      inProgressEvents: { 123: 70 },
      mostRecentEventTime: 'hello world'
    });
  });

  it('should not prepend when inProgress and mostRecentEventTime has changed', () => {
    expect(reducer(currentState, prependPayloadNoChange)).toEqual(currentState);
  });
});
