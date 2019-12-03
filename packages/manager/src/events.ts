/**
 * This file fills two needs;
 *  Maintain the polling interval for events,
 *  Push events from Redux onto the events$ stream.
 *
 * The pushing of events onto events$ is maintaining the existing API between Redux and components
 * which consume the events$ stream. Once all of the consumers of events$ have been updated
 * to consume directly from the Redux store, we can delete the events$ stream.
 *
 * The next step is to move this logic into a Redux connected component so we can more easily
 * access Redux and control the start of the event loop.
 */
import { Event } from 'linode-js-sdk/lib/account';
import { Subject } from 'rxjs/Subject';
import { DISABLE_EVENT_THROTTLE, INTERVAL } from 'src/constants';
import {
  getPollingInterval,
  getRequestDeadline,
  setPollingInterval,
  setRequestDeadline
} from 'src/eventsPolling';
import store from 'src/store';
import { getEvents } from 'src/store/events/event.request';
import { ThunkDispatch } from 'src/store/types';

export const events$ = new Subject<Event>();

let inProgress = false;

export const requestEvents = () => {
  inProgress = true;
  return (store.dispatch as ThunkDispatch)(getEvents())
    .then((events: Event[]) => {
      const reversed = events.reverse();

      /**
       * This feeds the stream for consumers of events$. We're simply pushing the events from the
       * request response onto the stream one at a time.
       */
      reversed.forEach((linodeEvent: Event) => {
        events$.next(linodeEvent);
      });
      inProgress = false;
    })
    .catch(e => e);
};

export const startEventsInterval = () =>
  setInterval(
    () => {
      const now = Date.now();
      const pollIteration = getPollingInterval();
      const eventRequestDeadline = getRequestDeadline();
      // For PR review purposes; delete before merge
      // console.count('iteration');
      // console.table({ pollIteration, eventRequestDeadline });

      if (now > eventRequestDeadline) {
        /**
         * If we're waiting on a request, set reset the pollIteration and return to prevent
         * overlapping requests.
         */
        if (inProgress) {
          /** leaving this commented out for now because I'm not sure if it'll break anything */
          // pollIteration = 1;
          return;
        }

        requestEvents();

        if (DISABLE_EVENT_THROTTLE) {
          /*
           * If throttling is disabled manually set the timeout so tests wait to query the mock data store.
           */
          setRequestDeadline(now + 500);
        } else {
          const timeout = INTERVAL * pollIteration;
          /** Update the dealing */
          setRequestDeadline(now + timeout);
          /* Update the iteration to a maximum of 16. */
          const newIteration = Math.min(pollIteration * 2, 16);
          if (pollIteration < 16) {
            setPollingInterval(newIteration);
          }
        }
      }
    },
    /* the following is the Nyquist rate for the minimum polling interval */
    INTERVAL / 2 - 1
  );
