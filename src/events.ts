import * as Rx from 'rxjs/Rx';
import { API_ROOT } from 'src/constants';
import Axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';

function createDatestamp() {
  return moment().utc().format('YYYY-MM-DDTHH:mm:ss');
}

const linodeEvents$ = new Rx.Subject();

let datestamp = createDatestamp();
let pollIDs: number[] = [];

/*
 * Until we can filter on IDs, we can't use this logic
function generateInFilter(keyName: string, arr: any[]) {
  return {
    '+or': arr.map(el => ({ [keyName]: el })),
  };
}
*/

function generatePollingFilter() {
  /*
   * Until we can filter on IDs, we can't use this logic
  return pollIDs.length ?
    {
      '+or': [
        { created: { '+gt': datestamp } },
        generateInFilter('id', pollIDs),
      ],
    }
    : { created: { '+gt': datestamp } };
  */
  return { created: { '+gt': datestamp } };
}

type EventResponse = AxiosResponse<Linode.ManyResourceState<Linode.Event>>;

const initial$ = Rx.Observable
  .defer(() =>
    Rx.Observable
      .fromPromise(
        Axios.get(`${API_ROOT}/account/events`)
          .then(
            (response: EventResponse) => response.data.data,
          ),
  ));

const polling$ = Rx.Observable
  .interval(2000)
  .flatMap(() =>
    Rx.Observable
      .fromPromise(
        Axios.get(
          `${API_ROOT}/account/events`,
          { headers: { 'X-Filter': JSON.stringify(
            generatePollingFilter(),
          ) } })
        .then((response: EventResponse) => response.data.data),
      ),
  );


const stream$: Rx.Observable<void | null> = Rx.Observable
  .merge(initial$, polling$)
  .scan(
    (_, value: Linode.Event[]) => {
      if (value[0]) {
        datestamp = value[0].created;
      }

      value.reverse().map((linEv) => {
        // if an Event completes it is removed from pollIDs
        if (linEv.percent_complete === 100 && pollIDs.includes(linEv.id)) {
          pollIDs = pollIDs.filter(id => id !== linEv.id);
        }

        // we poll for Event IDs that have not yet been completed
        if (linEv.percent_complete !== null && linEv.percent_complete < 100) {
          pollIDs.push(linEv.id);
        }

        linodeEvents$.next(linEv);
      });
    },
    null,
  );
  
const exp$ = stream$.publish();

exp$.subscribe(() => null);

// need this drain to get the machine moving
exp$.connect();

linodeEvents$
  .subscribe(
    (event: Linode.Event) => console.log('Event: ', event),
);
