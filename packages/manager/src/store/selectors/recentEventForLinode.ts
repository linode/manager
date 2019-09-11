import { Event } from 'linode-js-sdk/lib/account'
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import { isInProgressEvent } from 'src/store/events/event.helpers';

export default (linodeId: number) =>
  createSelector<ApplicationState, Event[], undefined | Event>(
    state => state.events.events,
    events => {
      let idx = 0;
      const len = events.length;
      for (; idx < len; idx += 1) {
        const event = events[idx];
        const { entity } = event;
        if (
          isInProgressEvent(event) &&
          entity &&
          entity.type === 'linode' &&
          entity.id === linodeId
        ) {
          return event;
        }
      }
      return undefined;
    }
  );
