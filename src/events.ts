import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import {
  assoc,
  compose,
  ifElse,
  isEmpty,
  isNil,
  lensPath,
  map,
  not,
  over,
  path,
  view,
  when,
} from 'ramda';

import isPast from 'src/utilities/isPast';
import { dateFormat } from 'src/time';
import { getEvents } from 'src/services/account';

function createInitialDatestamp() {
  return moment('1970-01-01 00:00:00.000Z').utc().format(dateFormat);
}

export const events$ = new Rx.Subject<Linode.Event>();

let filterDatestamp = createInitialDatestamp();
const pollIDs: { [key: string]: boolean } = {};

const initialPollInterval = 2000;
export let eventRequestDeadline = Date.now();
export let currentPollIntervalMultiplier = 1;

export function resetEventsPolling() {
  eventRequestDeadline = Date.now() + initialPollInterval;
  currentPollIntervalMultiplier = 1;
}
export const init = () => {
  filterDatestamp = createInitialDatestamp();
  resetEventsPolling();
};

export function generateInFilter(keyName: string, arr: any[]) {
  return {
    '+or': arr.map(el => ({ [keyName]: el })),
  };
}

export function generatePollingFilter(datestamp: string, pollIDs: string[]) {
  return pollIDs.length ?
    {
      '+or': [
        { created: { '+gt': datestamp } },
        generateInFilter('id', pollIDs),
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
          ifElse(
            isNil,
            () => false,
            compose(not, isPasttheBeginningOfTime),
          ),
          path(['created', '+gt']),
          when(compose(not, isEmpty), v => JSON.parse(v)),
          path(['config', 'headers', 'X-Filter']),
        ),
        over(lensPath(['data', 'data']), map(assoc('_initial', true))),
      )(response);

    } catch (error) { }

    return response;
  },
);

export function requestEvents() {
  getEvents(
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
        const newDatestamp = moment(data[0].created);
        const currentDatestamp = moment(filterDatestamp);
        if (newDatestamp > currentDatestamp) {
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

          /** If a Linode is deleted the /events end-points sends updated regarding shutting down
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

setInterval(
  () => {
    if (Date.now() > eventRequestDeadline) {
      requestEvents();

      eventRequestDeadline =
        Date.now() + initialPollInterval * currentPollIntervalMultiplier;
      /* double the polling interval with each poll up to 16x */
      currentPollIntervalMultiplier = Math.min(currentPollIntervalMultiplier * 2, 16);
    }
  },
  /* the following is the Nyquist rate for the minimum polling interval */
  (initialPollInterval / 2 - 1),
);


const isBeingDeleted = (events: Linode.Event[], id: number): boolean =>
  events.filter(event => event.id === id && event.action === 'linode_delete').length > 0;
