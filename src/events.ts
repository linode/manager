import * as Rx from 'rxjs/Rx';
import { API_ROOT } from 'src/constants';
import Axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';

function createDatestamp() {
  return moment().utc().format('YYYY-MM-DDTHH:mm:ss');
}

let datestamp = createDatestamp();

type EventResponse = AxiosResponse<Linode.ManyResourceState<Linode.Event>>;

/** Get events. */
const initial$ = Rx.Observable
  .defer(() =>
    Rx.Observable
      .fromPromise(
        Axios.get(`${API_ROOT}/account/events`)
          .then(
            (response: EventResponse) => response.data.data,
          ),
  ));

/** Get events. */
const polling$ = Rx.Observable
  .interval(5000)
  .flatMap(() =>
    Rx.Observable
      .fromPromise(
        Axios.get(
          `${API_ROOT}/account/events`,
          { headers: { 'X-Filter': JSON.stringify({ created: { '+gt': datestamp } }) } })
          .then((response: EventResponse) => response.data.data),
      ),
  );

const stream$: Rx.Observable<Linode.Event[]> = Rx.Observable
  .merge(initial$, polling$)
  .scan(
    (acc, value) => {
      if (value[0]) {
        datestamp = value[0].created;
      }

      return [...value, ...acc];
    },
    [],
  );
  
const exp$ = stream$
  .publish();
  
/** Example of how we'd get the events for the dropdown. */
exp$
  .map(d => d.slice(0, 5))
  .subscribe(
    (events: Linode.Event[]) => console.log('Events: ', events.map(e => e.id).join(', ')),
);

/** Example of how we would get the badge count. */
exp$
  .map(events => events.reduce((acc, current) => current.seen ? acc : acc + 1, 0))
  .subscribe((e) => { console.log('Unseen Events:', e); });

exp$.connect();
