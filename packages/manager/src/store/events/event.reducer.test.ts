import { Event } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';

import { addEvents } from './event.actions';
import reducer, { defaultState } from './event.reducer';

describe('events.reducer', () => {
  describe('reducer', () => {
    describe('ADD_EVENTS', () => {
      describe('with no events', () => {
        it('should return the initial state', () => {
          const action = addEvents([]);
          const state = reducer(defaultState, action);
          expect(state).toEqual(defaultState);
        });
      });

      describe('with events', () => {
        const events: Event[] = [
          {
            action: 'linode_reboot',
            created: '2018-12-03T22:34:09',
            duration: 0,
            entity: {
              id: 11241778,
              label: 'node-server',
              type: 'linode',
              url: '/v4/linode/instances/11241778',
            },
            id: 18029572,
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
            created: '2018-12-03T19:59:53',
            duration: 0,
            entity: {
              id: 11642886,
              label: 'linode11642886',
              type: 'linode',
              url: '/v4/linode/instances/11642886',
            },
            id: 18022171,
            message: null,
            percent_complete: 80,
            rate: null,
            read: false,
            secondary_entity: null,
            seen: false,
            status: 'started',
            time_remaining: null,
            username: 'test',
          },
        ];
        const action = addEvents(events);
        const state = reducer(defaultState, action);

        it('should add the events to the store.', () => {
          expect(state).toHaveProperty('events', events);
        });

        it('should update the mostRecentEventTime', () => {
          expect(state).toHaveProperty(
            'mostRecentEventTime',
            DateTime.fromISO('2018-12-03T22:34:09', { zone: 'utc' }).valueOf()
          );
        });

        it('should update the countUnseenEvents', () => {
          expect(state).toHaveProperty('countUnseenEvents', 1);
        });

        it('should update the inProgressEvents', () => {
          expect(state).toHaveProperty('inProgressEvents', { 18022171: 80 });
        });
      });
    });
  });
});
