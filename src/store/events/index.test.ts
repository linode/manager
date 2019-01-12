import * as moment from 'moment';

import reducer, {
  actions,
  addToEvents,
  defaultState,
  findInEvents,
  getNumUnseenEvents,
  isCompletedEvent,
  isInProgressEvent,
  mostRecentCreated,
  setDeletedEvents,
  updateInProgressEvents,
} from './index';

describe('events', () => {
  describe('reducer', () => {
    describe('ADD_EVENTS', () => {
      describe('with no events', () => {

        it('should return the initial state', () => {
          const action = actions.addEvents([]);
          const state = reducer(defaultState, action)
          expect(state).toEqual(defaultState);
        });
      });

      describe('with events', () => {
        const events: Linode.Event[] = [
          {
            id: 18029572,
            time_remaining: 0,
            seen: true,
            created: "2018-12-03T22:34:09",
            action: "linode_reboot",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: { "id": 11241778, "label": "node-server", "type": "linode", "url": "/v4/linode/instances/11241778" },
            status: "finished"
          },
          {
            id: 18022171,
            time_remaining: 0,
            seen: false,
            created: "2018-12-03T19:59:53",
            action: "linode_shutdown",
            read: false,
            percent_complete: 80,
            username: "coolguymarty",
            rate: null,
            entity: { "id": 11642886, "label": "linode11642886", "type": "linode", "url": "/v4/linode/instances/11642886" },
            status: "started"
          },
        ];
        const action = actions.addEvents(events);
        const state = reducer(defaultState, action)

        it('should add the events to the store.', () => {
          expect(state).toHaveProperty('events', events);
        });

        it('should update the mostRecentEventTime', () => {
          expect(state).toHaveProperty('mostRecentEventTime', moment.utc('2018-12-03T22:34:09').valueOf())
        });

        it('should update the countUnseenEvents', () => {
          expect(state).toHaveProperty('countUnseenEvents', 1);
        });

        it('should update the inProgressEvents', () => {
          expect(state).toHaveProperty('inProgressEvents', { 18022171: true })
        });
      });
    });

    describe('UPDATE_EVENTS_AS_SEEN', () => { });
  });

  describe('async', () => {
    describe('getEvents', () => { });
    describe('markAllSeen', () => { });
  });

  describe('utilities', () => {
    describe('findInEvents', () => {
      const entity = { id: 1, label: 'something', type: 'whatever', url: 'whoecares' };

      const event: Pick<Linode.Event, 'entity'> = { entity }

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
          { seen: true, },
          { seen: false, },
          { seen: false, },
          { seen: true, },
          { seen: false, },
          { seen: true, },
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
        const event = { percent_complete: 60 };
        const result = isInProgressEvent(event);
        expect(result).toBeTruthy();
      });

      it('should return false', () => {
        const event = { percent_complete: 100 };
        const result = isInProgressEvent(event);
        expect(result).toBeFalsy();
      });
    });

    describe('mostRecentCreated', () => {
      it('should return the most recent event time', () => {
        expect(
          mostRecentCreated(new Date(`1970-01-01T00:00:00`).getTime(), { created: `2018-12-03T22:37:20` })
        ).toBe(moment.utc(`2018-12-03T22:37:20`).valueOf());

        const recentTime = moment.utc(`2018-12-03T23:37:20`).valueOf();
        expect(
          mostRecentCreated(recentTime, { created: `2018-12-03T22:37:20` })
        ).toBe(recentTime);

      });
    });

    describe('setDeletedEvents', () => {
      it('should add a _deleted prop if entity refers to a deleted entity', () => {
        const events: Linode.Event[] = [
          {
            id: 17957944,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T23:15:45",
            action: "linode_delete",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: { "id": 11440645, "label": "linode11440645", "type": "linode", "url": "/v4/linode/instances/11440645" },
            status: "finished"
          },
          {
            id: 17957108,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T22:55:43",
            action: "linode_boot",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: { "id": 11440645, "label": "linode11440645", "type": "linode", "url": "/v4/linode/instances/11440645" },
            status: "finished",
          },
        ];

        const expected: ExtendedEvent[] = [
          {
            id: 17957944,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T23:15:45",
            action: "linode_delete",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: { "id": 11440645, "label": "linode11440645", "type": "linode", "url": "/v4/linode/instances/11440645" },
            status: "finished",
            _deleted: "2018-12-02T23:15:45",
          },
          {
            id: 17957108,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T22:55:43",
            action: "linode_boot",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: { "id": 11440645, "label": "linode11440645", "type": "linode", "url": "/v4/linode/instances/11440645" },
            status: "finished",
            _deleted: "2018-12-02T23:15:45",
          },
        ];

        const result = setDeletedEvents(events);
        expect(result).toEqual(expected);
      });
    });

    describe('addToEvents', () => {
      it('should append the event to the list', () => {
        const prevEvents: Linode.Event[] = [
          {
            id: 17957944,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T23:15:45",
            action: "linode_delete",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: null,
            status: "finished"
          },
          {
            id: 17957718,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T23:08:38",
            action: "linode_shutdown",
            read: false,
            percent_complete: 60,
            username: "coolguymarty",
            rate: null,
            entity: null,
            status: "started"
          },
          {
            id: 17957108,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T22:55:43",
            action: "linode_boot",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: null,
            status: "finished"
          },
        ];
        const events: Linode.Event[] = [
          {
            id: 17957718,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T23:08:38",
            action: "linode_shutdown",
            read: false,
            percent_complete: 70,
            username: "coolguymarty",
            rate: null,
            entity: null,
            status: "started"
          },
        ];
        const result = addToEvents(prevEvents, events);

        expect(result).toEqual([
          {
            id: 17957944,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T23:15:45",
            action: "linode_delete",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: null,
            status: "finished"
          },
          {
            id: 17957718,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T23:08:38",
            action: "linode_shutdown",
            read: false,
            percent_complete: 70,
            username: "coolguymarty",
            rate: null,
            entity: null,
            status: "started"
          },
          {
            id: 17957108,
            time_remaining: 0,
            seen: true,
            created: "2018-12-02T22:55:43",
            action: "linode_boot",
            read: false,
            percent_complete: 100,
            username: "coolguymarty",
            rate: null,
            entity: null,
            status: "finished"
          },
        ]);
      });

      describe('when updating an event', () => { });
    });

    describe('updateInProgressEvents', () => {
      it('should do nothing if there are no events', () => {
        const inProgressEvents = {};
        const events: Linode.Event[] = [];
        const result = updateInProgressEvents(inProgressEvents, events);
        expect(result).toEqual({})
      });

      it('should do nothing if there are no in-progress events', () => {
        const inProgressEvents = { '999': true };
        const events = [
          {
            id: 1,
            percent_complete: 100,
          },
          {
            id: 2,
            percent_complete: 100,
          },
          {
            id: 3,
            percent_complete: 100,
          },
        ];
        const result = updateInProgressEvents(inProgressEvents, events);
        expect(result).toEqual({ '999': true })
      });

      it('should add in-progress events to the Map', () => {
        const inProgressEvents = {};
        const events = [
          {
            id: 1,
            percent_complete: 100,
          },
          {
            id: 2,
            percent_complete: 60,
          },
          {
            id: 3,
            percent_complete: 100,
          },
        ];
        const result = updateInProgressEvents(inProgressEvents, events);

        expect(result).toEqual({ '2': true })
      });
    });
  });
});
