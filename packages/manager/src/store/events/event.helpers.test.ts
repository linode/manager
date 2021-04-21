import { Event } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { eventFactory } from 'src/factories/events';
import {
  addToEvents,
  findInEvents,
  getNumUnseenEvents,
  isCompletedEvent,
  isInProgressEvent,
  mostRecentCreated,
  setDeletedEvents,
  updateInProgressEvents,
} from './event.helpers';
import { ExtendedEvent } from './event.types';

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
          id: 17957944,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T23:15:45',
          action: 'linode_delete',
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          status: 'finished',
          duration: 0,
          message: null,
        },
        {
          id: 17957108,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T22:55:43',
          action: 'linode_boot',
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          status: 'finished',
          duration: 0,
          message: null,
        },
      ];

      const expected: ExtendedEvent[] = [
        {
          id: 17957944,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T23:15:45',
          action: 'linode_delete',
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          status: 'finished',
          _deleted: '2018-12-02T23:15:45',
          duration: 0,
          message: null,
        },
        {
          id: 17957108,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T22:55:43',
          action: 'linode_boot',
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: {
            id: 11440645,
            label: 'linode11440645',
            type: 'linode',
            url: '/v4/linode/instances/11440645',
          },
          status: 'finished',
          _deleted: '2018-12-02T23:15:45',
          duration: 0,
          message: null,
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
          id: 17957944,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T23:15:45',
          action: 'linode_delete',
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: null,
          status: 'finished',
          duration: 0,
          message: null,
        },
        {
          id: 17957718,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T23:08:38',
          action: 'linode_shutdown',
          read: false,
          percent_complete: 60,
          username: 'test',
          rate: null,
          entity: null,
          status: 'started',
          duration: 0,
          message: null,
        },
        {
          id: 17957108,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T22:55:43',
          action: 'linode_boot',
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: null,
          status: 'finished',
          duration: 0,
          message: null,
        },
      ];
      const events: Event[] = [
        {
          id: 17957718,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T23:08:38',
          action: 'linode_shutdown',
          read: false,
          percent_complete: 70,
          username: 'test',
          rate: null,
          entity: null,
          status: 'started',
          duration: 0,
          message: null,
        },
      ];
      const result = addToEvents(prevEvents, events);

      expect(result).toEqual([
        {
          id: 17957944,
          time_remaining: null,
          seen: true,
          created: '2018-12-02T23:15:45',
          action: 'linode_delete',
          secondary_entity: null,
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: null,
          status: 'finished',
          duration: 0,
          message: null,
        },
        {
          id: 17957718,
          time_remaining: null,
          seen: true,
          created: '2018-12-02T23:08:38',
          action: 'linode_shutdown',
          secondary_entity: null,
          read: false,
          percent_complete: 70,
          username: 'test',
          rate: null,
          entity: null,
          status: 'started',
          duration: 0,
          message: null,
        },
        {
          id: 17957108,
          time_remaining: null,
          secondary_entity: null,
          seen: true,
          created: '2018-12-02T22:55:43',
          action: 'linode_boot',
          read: false,
          percent_complete: 100,
          username: 'test',
          rate: null,
          entity: null,
          status: 'finished',
          duration: 0,
          message: null,
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
