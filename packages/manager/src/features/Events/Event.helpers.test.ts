import { EventAction } from 'linode-js-sdk/lib/account';
import { reduxEvent, uniqueEvents } from 'src/__data__/events';
import {
  filterUniqueEvents,
  formatEventWithUsername,
  maybeRemoveTrailingPeriod,
  percentCompleteHasUpdated,
  shouldUpdateEvents
} from './Event.helpers';

const inProgressEvents = {
  1234: 50,
  1235: 20
};

const nextInProgressEvents = {
  1234: 80
};

const mostRecentEventTime = '1556810353941';
const nextTime = '1556810370715';

describe('Utility Functions', () => {
  it('should filter out unique events', () => {
    expect(filterUniqueEvents([reduxEvent, reduxEvent])).toHaveLength(1);
    expect(filterUniqueEvents(uniqueEvents)).toHaveLength(2);
  });

  it('should return true if percent complete has changed', () => {
    expect(
      percentCompleteHasUpdated(inProgressEvents, inProgressEvents)
    ).toBeFalsy();
    expect(
      percentCompleteHasUpdated(inProgressEvents, nextInProgressEvents)
    ).toBeTruthy();
    expect(percentCompleteHasUpdated(inProgressEvents, {})).toBeTruthy();
  });

  it('should update events if most recent event time has changed', () => {
    expect(
      shouldUpdateEvents(
        {
          inProgressEvents,
          mostRecentEventTime
        },
        {
          inProgressEvents,
          mostRecentEventTime: nextTime
        }
      )
    ).toBeTruthy();
  });

  it('should update if event progress has updated', () => {
    expect(
      shouldUpdateEvents(
        {
          inProgressEvents,
          mostRecentEventTime
        },
        {
          inProgressEvents: nextInProgressEvents,
          mostRecentEventTime
        }
      )
    ).toBeTruthy();
    expect(
      shouldUpdateEvents(
        {
          inProgressEvents,
          mostRecentEventTime
        },
        {
          inProgressEvents: {},
          mostRecentEventTime
        }
      )
    ).toBeTruthy();
  });

  it('should not update if nothing has changed', () => {
    expect(
      shouldUpdateEvents(
        {
          inProgressEvents,
          mostRecentEventTime
        },
        {
          inProgressEvents,
          mostRecentEventTime
        }
      )
    ).toBeFalsy();
  });

  describe('formatEventWithUsername utility', () => {
    it('it should return a message for an event without a username unchanged', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername('linode_boot' as EventAction, null, message, 0)
      ).toEqual(message);
    });

    it('should append the username to a normal event', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername(
          'linode_boot' as EventAction,
          'test-user-001',
          message,
          0
        )
      ).toEqual('a message by test-user-001.');
    });

    it('should append the username to a normal event', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername(
          'lassie_reboot' as EventAction,
          'test-user-001',
          message,
          0
        )
      ).toEqual(message);
    });
  });

  describe('maybeRemoveTrailingPeriod', () => {
    it('should remove trailing periods', () => {
      expect(maybeRemoveTrailingPeriod('hello world.')).toBe('hello world');
      expect(maybeRemoveTrailingPeriod('hello wor..ld')).toBe('hello wor..ld');
      expect(maybeRemoveTrailingPeriod('hello world')).toBe('hello world');
      expect(maybeRemoveTrailingPeriod('hello. world')).toBe('hello. world');
    });
  });
});
