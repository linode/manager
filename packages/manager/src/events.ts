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
import { DISABLE_EVENT_THROTTLE } from 'src/constants';
import store from 'src/store';
import { getEvents } from 'src/store/events/event.request';

export const events$ = new Subject<Event>();

export let eventRequestDeadline = Date.now();

/**
 * The current iteration of the poll. 1, 2, 4, 8, 16.
 */
export let pollIteration = 1;

/**
 * The lowest interval at which to make a request. This is later multiplied by the pollIteration
 * to get the actual interval.
 */
export const INTERVAL: number = 1000;

let inProgress = false;

export const resetEventsPolling = (newPollIteration = 1) => {
  eventRequestDeadline = Date.now() + INTERVAL * newPollIteration;
  pollIteration = newPollIteration;
};

export const requestEvents = () => {
  inProgress = true;
  return store.dispatch(getEvents() as any).then((events: Event[]) => {
    const reversed = events.reverse();

    /**
     * This feeds the stream for consumers of events$. We're simply pushing the events from the
     * request response onto the stream one at a time.
     */
    reversed.forEach((linodeEvent: Event) => {
      events$.next(linodeEvent);
    });
    inProgress = false;
  });
};

export const startEventsInterval = () =>
  setInterval(
    () => {
      const now = Date.now();
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
          eventRequestDeadline = now + 500;
        } else {
          const timeout = INTERVAL * pollIteration;
          /** Update the dealing */
          eventRequestDeadline = now + timeout;
          /* Update the iteration to a maximum of 16. */
          pollIteration = Math.min(pollIteration * 2, 16);
        }
      }
    },
    /* the following is the Nyquist rate for the minimum polling interval */
    INTERVAL / 2 - 1
  );
