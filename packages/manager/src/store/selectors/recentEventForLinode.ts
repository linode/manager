import { Event } from 'linode-js-sdk/lib/account';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import { isEventRelevantToLinode } from '../events/event.selectors';

export default (linodeId: number) =>
  createSelector<ApplicationState, Event[], undefined | Event>(
    state => state.events.events,
    events => {
      let idx = 0;
      const len = events.length;
      for (; idx < len; idx += 1) {
        const event = events[idx];
        if (isEventRelevantToLinode(event, linodeId)) {
          return event;
        }
      }
      return undefined;
    }
  );
