import { eventFactory } from 'src/factories/events';

import { getHighestEventId, getHighestUnseenEventId } from './utils';

import type { NotificationItem } from 'src/features/NotificationCenter/NotificationSection';

describe('getHighestEventId', () => {
  it('should return null for an empty array', () => {
    expect(getHighestEventId([])).toBe(null);
  });

  it('should return the highest id of events', () => {
    eventFactory.resetSequenceNumber();
    const mockEvents = eventFactory.buildList(25);
    expect(getHighestEventId(mockEvents)).toBe(25);
  });

  it('should return the highest eventId from an array of NotificationItems', () => {
    const notifications: NotificationItem[] = [
      {
        body: 'Notification 1',
        countInTotal: true,
        eventId: 2,
        id: 'notification1',
      },
      {
        body: 'Notification 2',
        countInTotal: false,
        eventId: 8,
        id: 'notification2',
      },
      {
        body: 'Notification 3',
        countInTotal: true,
        eventId: 4,
        id: 'notification3',
      },
    ];
    expect(getHighestEventId(notifications)).toBe(8);
  });
});

describe('getHighestUnseenEventId', () => {
  beforeEach(() => {
    eventFactory.resetSequenceNumber();
  });

  it('should return null for an empty array', () => {
    expect(getHighestUnseenEventId([])).toBe(null);
  });

  it('should return the highest id of unseen events', () => {
    const mockEvents = eventFactory.buildList(25, {
      seen: false,
    });
    expect(getHighestUnseenEventId(mockEvents)).toBe(25);
  });

  it('should return null if all events are seen', () => {
    const mockEvents = eventFactory.buildList(25, {
      seen: true,
    });
    expect(getHighestUnseenEventId(mockEvents)).toBe(null);
  });

  it('should handle a large number of events efficiently', () => {
    const mockEvents = eventFactory.buildList(100);
    expect(getHighestUnseenEventId(mockEvents)).toBe(100);
  });
});
