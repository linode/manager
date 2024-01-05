import { eventFactory } from 'src/factories/events';

import {
  filterUniqueEvents,
  formatEventWithAppendedText,
  formatEventWithUsername,
  maybeRemoveTrailingPeriod,
  percentCompleteHasUpdated,
  shouldUpdateEvents,
} from './Event.helpers';

import type { Event, EventAction } from '@linode/api-v4';

const uniqueEvents: Event[] = [
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
    id: 1231234,
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
    id: 17950407,
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

const inProgressEvents = {
  1234: 50,
  1235: 20,
};

const nextInProgressEvents = {
  1234: 80,
};

const mostRecentEventTime = '1556810353941';
const nextTime = '1556810370715';

describe('Utility Functions', () => {
  it('should filter out unique events', () => {
    const mockEvent: Event = eventFactory.build();
    expect(filterUniqueEvents([mockEvent, mockEvent])).toHaveLength(1);
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
          mostRecentEventTime,
        },
        {
          inProgressEvents,
          mostRecentEventTime: nextTime,
        }
      )
    ).toBeTruthy();
  });

  it('should update if event progress has updated', () => {
    expect(
      shouldUpdateEvents(
        {
          inProgressEvents,
          mostRecentEventTime,
        },
        {
          inProgressEvents: nextInProgressEvents,
          mostRecentEventTime,
        }
      )
    ).toBeTruthy();
    expect(
      shouldUpdateEvents(
        {
          inProgressEvents,
          mostRecentEventTime,
        },
        {
          inProgressEvents: {},
          mostRecentEventTime,
        }
      )
    ).toBeTruthy();
  });

  it('should not update if nothing has changed', () => {
    expect(
      shouldUpdateEvents(
        {
          inProgressEvents,
          mostRecentEventTime,
        },
        {
          inProgressEvents,
          mostRecentEventTime,
        }
      )
    ).toBeFalsy();
  });

  describe('formatEventWithUsername utility', () => {
    it('it should return a message for an event without a username unchanged', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername('linode_boot' as EventAction, null, message)
      ).toEqual(message);
    });

    it('should append the username to a normal event', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername(
          'linode_boot' as EventAction,
          'test-user-001',
          message
        )
      ).toEqual('a message by **test-user-001**.');
    });

    it('should append the username to a normal event', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername(
          'lassie_reboot' as EventAction,
          'test-user-001',
          message
        )
      ).toEqual(message);
    });

    it('should not reappend a username to any event already containing one', () => {
      const message = 'a message by **test-user-001**';
      expect(
        formatEventWithUsername(
          'resize_disk' as EventAction,
          'test-user-001',
          message
        )
      ).toEqual(message);
    });
  });

  describe('formatEventWithAppendedText utility', () => {
    it('should append text to the end of an existing event message', () => {
      const message = 'a message by **test-user-001**.';
      const appendedText = 'Text to append.';
      const mockEvent = eventFactory.build({
        username: 'test-user-001',
      });

      expect(
        formatEventWithAppendedText(mockEvent, message, appendedText)
      ).toEqual(`${message} ${appendedText}`);
    });

    it('should append hyperlinked text to the end of an existing event message', () => {
      const message = 'a message.';
      const appendedText = 'Link to append.';
      const link = 'https://cloud.linode.com';
      const mockEvent = eventFactory.build({
        username: null,
      });

      expect(
        formatEventWithAppendedText(mockEvent, message, appendedText, link)
      ).toEqual(
        `${message} <a href=\"${link}\" target=_blank>${appendedText}</a>.`
      );
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
