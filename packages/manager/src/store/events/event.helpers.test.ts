import { Event } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';

import { entityFactory, eventFactory } from 'src/factories/events';

import {
  addToEvents,
  findInEvents,
  getNumUnseenEvents,
  isCompletedEvent,
  isEventRelevantToLinode,
  isEventRelevantToLinodeAsSecondaryEntity,
  isInProgressEvent,
  isPrimaryEntity,
  isSecondaryEntity,
  mostRecentCreated,
  setDeletedEvents,
  updateInProgressEvents,
} from './event.helpers';

describe('event.helpers', () => {
  describe('findInEvents', () => {
    const entity = {
      id: 1,
      label: 'something',
      type: 'whatever',
      url: 'whoecares',
    };

    const event: Pick<Event, 'entity'> = { entity };

    it('should return index when entity is found', () => {
      const result = findInEvents([event], entity);
      expect(result).toBe(0);
    });

    it('should return index when entity is found', () => {
      const result = findInEvents([], entity);
      expect(result).toBe(-1);
    });
  });

  describe('getNumUnseenEvents', () => {
    it('should return number of unseen events', () => {
      const events = [
        { seen: true },
        { seen: false },
        { seen: false },
        { seen: true },
        { seen: false },
        { seen: true },
      ];
      const result = getNumUnseenEvents(events);
      expect(result).toBe(3);
    });
  });

  describe('isCompletedEvent', () => {
    it('should return true', () => {
      const event = { percent_complete: 100 };
      const result = isCompletedEvent(event);
      expect(result).toBeTruthy();
    });

    it('should return false', () => {
      const event = { percent_complete: 60 };
      const result = isCompletedEvent(event);
      expect(result).toBeFalsy();
    });
  });

  describe('isInProgressEvent', () => {
    it('should return true', () => {
      const event = eventFactory.build({ percent_complete: 60 });
      const result = isInProgressEvent(event);
      expect(result).toBeTruthy();
    });

    it('should return false', () => {
      const event = eventFactory.build({ percent_complete: 100 });
      const result = isInProgressEvent(event);
      expect(result).toBeFalsy();
    });
  });

  describe('mostRecentCreated', () => {
    it('should return the most recent event time', () => {
      expect(
        mostRecentCreated(new Date(`1970-01-01T00:00:00`).getTime(), {
          created: `2018-12-03T22:37:20`,
        })
      ).toBe(
        DateTime.fromISO(`2018-12-03T22:37:20`, { zone: 'UTC' }).valueOf()
      );

      const recentTime = DateTime.fromISO(`2018-12-03T23:37:20`, {
        zone: 'UTC',
      }).valueOf();
      expect(
        mostRecentCreated(recentTime, { created: `2018-12-03T22:37:20` })
      ).toBe(recentTime);
    });
  });

  describe('setDeletedEvents', () => {
    it('should add a _deleted prop if entity refers to a deleted entity', () => {
      const events: Event[] = [
        {
          action: 'linode_delete',
          created: '2018-12-02T23:15:45',
          duration: 0,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          id: 17957944,
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
          created: '2018-12-02T22:55:43',
          duration: 0,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          id: 17957108,
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

      const expected: Event[] = [
        {
          action: 'linode_delete',
          created: '2018-12-02T23:15:45',
          duration: 0,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          id: 17957944,
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
          created: '2018-12-02T22:55:43',
          duration: 0,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          id: 17957108,
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

      const result = setDeletedEvents(events);
      expect(result).toEqual(expected);
    });
  });

  describe('addToEvents', () => {
    it('should append the event to the list', () => {
      const prevEvents: Event[] = [
        {
          action: 'linode_delete',
          created: '2018-12-02T23:15:45',
          duration: 0,
          entity: null,
          id: 17957944,
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
          action: 'linode_shutdown',
          created: '2018-12-02T23:08:38',
          duration: 0,
          entity: null,
          id: 17957718,
          message: null,
          percent_complete: 60,
          rate: null,
          read: false,
          secondary_entity: null,
          seen: true,
          status: 'started',
          time_remaining: null,
          username: 'test',
        },
        {
          action: 'linode_boot',
          created: '2018-12-02T22:55:43',
          duration: 0,
          entity: null,
          id: 17957108,
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
      const events: Event[] = [
        {
          action: 'linode_shutdown',
          created: '2018-12-02T23:08:38',
          duration: 0,
          entity: null,
          id: 17957718,
          message: null,
          percent_complete: 70,
          rate: null,
          read: false,
          secondary_entity: null,
          seen: true,
          status: 'started',
          time_remaining: null,
          username: 'test',
        },
      ];
      const result = addToEvents(prevEvents, events);

      expect(result).toEqual([
        {
          action: 'linode_delete',
          created: '2018-12-02T23:15:45',
          duration: 0,
          entity: null,
          id: 17957944,
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
          action: 'linode_shutdown',
          created: '2018-12-02T23:08:38',
          duration: 0,
          entity: null,
          id: 17957718,
          message: null,
          percent_complete: 70,
          rate: null,
          read: false,
          secondary_entity: null,
          seen: true,
          status: 'started',
          time_remaining: null,
          username: 'test',
        },
        {
          action: 'linode_boot',
          created: '2018-12-02T22:55:43',
          duration: 0,
          entity: null,
          id: 17957108,
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
      ]);
    });
  });

  describe('updateInProgressEvents', () => {
    it('should do nothing if there are no events', () => {
      const inProgressEvents = {};
      const events: Event[] = [];
      const result = updateInProgressEvents(inProgressEvents, events);
      expect(result).toEqual({});
    });

    it('should do nothing if there are no in-progress events', () => {
      const inProgressEvents = { '999': 23 };
      const events = eventFactory.buildList(3, { percent_complete: 100 });
      const result = updateInProgressEvents(inProgressEvents, events);
      expect(result).toEqual({ '999': 23 });
    });

    it('should add in-progress events to the Map', () => {
      const inProgressEvents = {};
      const events = eventFactory.buildList(3, { percent_complete: 100 });
      // Mark one event as in progress
      events[1].percent_complete = 60;
      const result = updateInProgressEvents(inProgressEvents, events);

      expect(result).toEqual({ [events[1].id]: 60 });
    });
  });
});

describe('event selector helpers', () => {
  describe('isEventRelevantToLinode', () => {
    const event0 = eventFactory.build({
      action: 'linode_create',
      entity: entityFactory.build({ id: 0 }),
    });
    const event1 = eventFactory.build({
      action: 'linode_create',
      entity: entityFactory.build({ id: 1 }),
    });
    const event2 = eventFactory.build({
      action: 'linode_create',
      entity: entityFactory.build({ id: 100 }),
      secondary_entity: entityFactory.build({ id: 1 }),
    });
    const event3 = eventFactory.build({
      action: 'linode_clone',
      secondary_entity: entityFactory.build({ id: 1 }),
    });
    it("returns `true` when the linodeId is the event's entity ID, or if it's the event's secondary_entity ID and the event is relevant", () => {
      expect(isEventRelevantToLinode(event0, 0)).toBe(true);
      expect(isEventRelevantToLinode(event1, 0)).toBe(false);
      expect(isEventRelevantToLinode(event2, 1)).toBe(false);
      expect(isEventRelevantToLinode(event3, 1)).toBe(true);
    });
  });

  describe('isPrimaryEntity', () => {
    const event = eventFactory.build({
      entity: entityFactory.build({ id: 1 }),
    });
    it("returns `true` when the linodeId matches the event's entity ID", () => {
      expect(isPrimaryEntity(event, 0)).toBe(false);
      expect(isPrimaryEntity(event, 1)).toBe(true);
    });
  });

  describe('isSecondaryEntity', () => {
    const event = eventFactory.build({
      secondary_entity: entityFactory.build({ id: 1 }),
    });
    it("returns `true` when the linodeId matches the event's secondary_entity ID", () => {
      expect(isSecondaryEntity(event, 0)).toBe(false);
      expect(isSecondaryEntity(event, 1)).toBe(true);
    });
  });

  describe('isEventRelevantToLinodeAsSecondaryEntity', () => {
    const linodeCreateEvent = eventFactory.build({
      action: 'linode_create',
    });
    const linodeCloneEvent = eventFactory.build({
      action: 'linode_clone',
    });
    it('returns `true` if the event type is relevant to Linodes as secondary entities', () => {
      expect(isEventRelevantToLinodeAsSecondaryEntity(linodeCreateEvent)).toBe(
        false
      );
      expect(isEventRelevantToLinodeAsSecondaryEntity(linodeCloneEvent)).toBe(
        true
      );
    });
  });
});
