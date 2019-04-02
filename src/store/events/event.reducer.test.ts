import * as moment from 'moment';
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
        const events: Linode.Event[] = [
          {
            id: 18029572,
            time_remaining: 0,
            seen: true,
            created: '2018-12-03T22:34:09',
            action: 'linode_reboot',
            read: false,
            percent_complete: 100,
            username: 'coolguymarty',
            rate: null,
            entity: {
              id: 11241778,
              label: 'node-server',
              type: 'linode',
              url: '/v4/linode/instances/11241778'
            },
            status: 'finished'
          },
          {
            id: 18022171,
            time_remaining: 0,
            seen: false,
            created: '2018-12-03T19:59:53',
            action: 'linode_shutdown',
            read: false,
            percent_complete: 80,
            username: 'coolguymarty',
            rate: null,
            entity: {
              id: 11642886,
              label: 'linode11642886',
              type: 'linode',
              url: '/v4/linode/instances/11642886'
            },
            status: 'started'
          }
        ];
        const action = addEvents(events);
        const state = reducer(defaultState, action);

        it('should add the events to the store.', () => {
          expect(state).toHaveProperty('events', events);
        });

        it('should update the mostRecentEventTime', () => {
          expect(state).toHaveProperty(
            'mostRecentEventTime',
            moment.utc('2018-12-03T22:34:09').valueOf()
          );
        });

        it('should update the countUnseenEvents', () => {
          expect(state).toHaveProperty('countUnseenEvents', 1);
        });

        it('should update the inProgressEvents', () => {
          expect(state).toHaveProperty('inProgressEvents', { 18022171: true });
        });
      });
    });
  });
});
