import * as moment from 'moment';
import { assoc, compose, either, ifElse, isEmpty, isNil, lensPath, map, not, over, path, view, when } from 'ramda';
import { Subject } from 'rxjs/Subject';

import { DISABLE_EVENT_THROTTLE } from 'src/constants';
import { getEvents } from 'src/services/account';
import { dateFormat } from 'src/time';
import isPast from 'src/utilities/isPast';

const createInitialDatestamp = () => {
  return moment('1970-01-01 00:00:00.000Z').utc().format(dateFormat);
}

export const events$ = new Subject<Linode.Event>();

let filterDatestamp = createInitialDatestamp();
const pollIDs: { [key: string]: boolean } = {};

const initialPollInterval = 2000;


export let eventRequestDeadline = Date.now();
export let currentPollIntervalMultiplier = 1;

export const resetEventsPolling = () => {
  eventRequestDeadline = Date.now() + initialPollInterval;
  currentPollIntervalMultiplier = 1;
}
export const init = () => {
  filterDatestamp = createInitialDatestamp();
  resetEventsPolling();
};

export const generateInFilter = (keyName: string, arr: any[]) => {
  return {
    '+or': arr.map(el => ({ [keyName]: el })),
  };
}

export const generatePollingFilter = (datestamp: string, pollIDsAsArr: string[]) => {
  /**
   * If we have events that we are polling for
   * do an "or" X-Filter
   */
  return pollIDsAsArr.length ?
    {
      '+or': [
        { created: { '+gt': datestamp } },
        generateInFilter('id', pollIDsAsArr),
      ],
    }
    : {
      created: { '+gt': datestamp },
    };
}

const theBeginningOfTime = moment.utc('1970-01-01 00:00:00.000Z').format();
const isPasttheBeginningOfTime = isPast(theBeginningOfTime);

/**
 * If the X-Filter is set we parse it and check for and compare the created.+gt value to
 * "the beginning of time". If the value is greater, do nothing, otherwise update the events to have
 * an _initial prop of true.
 */

export const setInitialEvents = when(
  compose(not, isNil, view(lensPath(['config', 'headers', 'X-Filter']))),

  (response) => {
    try {
      return when(
        compose(
          /**
           * checking if the datestamp returned below is null
           */
          ifElse(
            isNil,
            () => false,
            /**
             * condition to check whether the X-Filter
             * time stamp is past the beginning of time.
             * If this condition returns true (AKA is the beginning of time)
             * add the _ititial flag to each event
             */
            compose(not, isPasttheBeginningOfTime),
          ),
          /**
           * Get the current dateTime filter, again depending on what is returned
           * from generatePollingFilter
           */
          either(path(['created', '+gt']) as any, path(['+or', 0, 'created', '+gt']) as any),
          /**
           * If the X-Filter is not empty, parse the filter as an object
           * dictated by what is returned by generatePollingFilter
           */
          when(compose(not, isEmpty), v => JSON.parse(v)),
          /**
           * we're looking at the current /event filter
           */
          path(['config', 'headers', 'X-Filter']),
        ),
        /**
         * set an _ititial property on each event if the above
         * condition is satisfied
         */
        over(lensPath(['data', 'data']), map(assoc('_initial', true))),
      )(response);

    } catch (error) { return response; }
  },
);

export const requestEvents = () => {
  getEvents(
    { page_size: 25 },
    generatePollingFilter(filterDatestamp, Object.keys(pollIDs)),
  )
    .then(setInitialEvents)
    .then(response => response.data.data)
    .then((data) => {
      /*
        * Events come back in reverse chronological order, so we update our
        * datestamp with the latest Event that we've seen. We need to perform
        * a date comparison here because we also might get back some old events
        * from IDs that we're polling for.
        */

      if (data[0]) {
        /**
         * Get the created date of the most recent event
         */
        const newDatestamp = moment(data[0].created);
        const currentDatestamp = moment(filterDatestamp);
        if (newDatestamp > currentDatestamp) {
          /**
           * set the X-Filter timeStamp to the most recent event's
           * created timestamp so that we're getting more recent events
           */
          filterDatestamp = newDatestamp.format(dateFormat);
        }
      }

      data.reverse().map((linodeEvent: Linode.Event, idx: number, events: Linode.Event[]) => {
        // if an Event completes it is removed from pollIDs
        if (linodeEvent.percent_complete === 100
          && pollIDs[linodeEvent.id]) {
          delete pollIDs[linodeEvent.id];
        }

        // we poll for Event IDs that have not yet been completed
        if (
          linodeEvent.percent_complete !== null
          && linodeEvent.percent_complete < 100

          /** 
           * If a Linode is deleted the /events end-points sends updated regarding shutting down
           * and eventuallly deletion. Subscribers of this stream want active Linodes only, and
           * if provided a "deleted" Linode ID will result in 404s until the events stop.
           */
          && !isBeingDeleted(events, linodeEvent.id)
        ) {
          // when we have an "incomplete event" poll at the initial polling rate
          resetEventsPolling();
          pollIDs[linodeEvent.id] = true;
        }

        events$.next(linodeEvent);
      });
    });
}

/**
 * Executes every 999 ms, as per described by the
 * initialPollInterval / 2 - 1
 */
setInterval(
  () => {
    /**
     * The events request deadline is a time limit for the events to re-poll
     * the deadline is updated every interval (dictated by the currentPollIntervalMultiplier)
     * 
     * example: if the multiplier is 16, the deadline will be 32 seconds in the future
     * as dictated by initialPollInterval * currentPollIntervalMultiplier (the initialPollInterval will not change)
     */
    if (Date.now() > eventRequestDeadline) {
      requestEvents();

      if (DISABLE_EVENT_THROTTLE) {
        /* If throttling is disabled, don't use or update the multiplier */
        const mocksPollingInterval = 500;

        eventRequestDeadline = Date.now() + mocksPollingInterval;
      } else {
        eventRequestDeadline = Date.now()
          + initialPollInterval * currentPollIntervalMultiplier;
        /* double the polling interval with each poll up to 16x */
        currentPollIntervalMultiplier = Math.min(currentPollIntervalMultiplier * 2, 16);
      }
    }
  },
  /* the following is the Nyquist rate for the minimum polling interval */
  (initialPollInterval / 2 - 1),
);

const isBeingDeleted = (events: Linode.Event[], id: number): boolean =>
  events.filter(event => event.id === id && event.action === 'linode_delete').length > 0;
