import * as Rx from 'rxjs/Rx';
import { API_ROOT } from 'src/constants';
import Axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';

import { dateFormat } from 'src/time';

function createInitialDatestamp() {
  return moment('1970-01-01 00:00:00.000Z').utc().format(dateFormat);
}

export const events$ = new Rx.Subject<Linode.Event>();

let filterDatestamp = createInitialDatestamp();
const pollIDs: { [key: string]: boolean} = {};

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

type EventResponse = AxiosResponse<Linode.ManyResourceState<Linode.Event>>;

export function requestEvents() {
  Axios.get(
    `${API_ROOT}/account/events`,
    { headers: { 'X-Filter': JSON.stringify(
      generatePollingFilter(filterDatestamp, Object.keys(pollIDs)),
    ) } })
  .then((response: EventResponse) => response.data.data)
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

    data.reverse().map((linodeEvent) => {
      // if an Event completes it is removed from pollIDs
      if (linodeEvent.percent_complete === 100
          && pollIDs[linodeEvent.id]) {
        delete pollIDs[linodeEvent.id];
      }

      // we poll for Event IDs that have not yet been completed
      if (linodeEvent.percent_complete !== null && linodeEvent.percent_complete < 100) {
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
