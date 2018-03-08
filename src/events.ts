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

const linodeEvents$ = new Rx.Subject();

const stream$: Rx.Observable<void | null> = Rx.Observable
  .merge(initial$, polling$)
  .scan(
    (_, value: Linode.Event[]) => {
      if (value[0]) {
        datestamp = value[0].created;
      }

      value.reverse().map(linEv => linodeEvents$.next(linEv));
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
