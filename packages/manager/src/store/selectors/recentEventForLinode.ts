import { Event } from '@linode/api-v4/lib/account';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import { isInProgressEvent } from '../events/event.helpers';
import { isEventRelevantToLinode } from '../events/event.selectors';

export const useRecentEventForLinode = (linodeId: number) => {
  const events = useSelector((state: ApplicationState) => state.events.events);
  let idx = 0;
  const len = events.length;
  for (; idx < len; idx += 1) {
    const event = events[idx];
    if (isInProgressEvent(event) && isEventRelevantToLinode(event, linodeId)) {
      return event;
    }
  }
  return undefined;
};

export default (linodeId: number) =>
  createSelector<ApplicationState, Event[], undefined | Event>(
    (state) => state.events.events,
    (events) => {
      let idx = 0;
      const len = events.length;
      for (; idx < len; idx += 1) {
        const event = events[idx];
        if (
          isInProgressEvent(event) &&
          isEventRelevantToLinode(event, linodeId)
        ) {
          return event;
        }
      }
      return undefined;
    }
  );
