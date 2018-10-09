/**
 *
 * ownProps$ is Observable<ownProps>.
 *  - Created by recompose
 *  - Anytime regular props update, ownProps$ will emit an object of the props.
 *
 * updatingLinodesTable$ is Observable<UpdatingLinodesTable>.
 *  - TLDR; Starts with events, maps to a Promise, maps to a hash table (state).
 *
 * Details (in order);
 *  We filter Observable<Linode.Event> for specific events.
 *  When an event we care about happens;
 *    - Request the Linode for which the event occured,
 *    - Merge the response of the Linode request with the event that triggered it,
 *    - Add the LinodeWithEvent to the UpdateLinodesTable { [linodeId]: LinodeWithEvent }.
 *    - UpdatedLinodesTable is emitted.
 *
 * The latest values from ownProps$ and updatingLinodesTable$ are merged by merging any updated
 * Linode, with it's relevant event, into the original provided Linodes (ownProps.data).
 *
 * The value of the returned Observable will be spead to the underlying component as props.
 */

import { pathEq, pathSatisfies } from 'ramda';
import { mapPropsStream } from 'recompose';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/from';

import { events$ } from 'src/events';
import { getLinode } from 'src/services/linodes';

interface PropsIn { data?: Linode.Linode[] };

const isWhitelistedAction = (v: string) => [
  'linode_boot',
  'linode_reboot',
  'linode_shutdown',
  'linode_snapshot',
  'linode_rebuild',
  'linode_resize',
  'linode_migrate',
].includes(v);

const isWhitelistedStatus = (v: string) => [
  'started',
  'finished',
  'scheduled',
  'failed',
].includes(v);

export default mapPropsStream<PropsIn, PropsIn>((ownProps: Observable<PropsIn>) => {
  const updatingLinodesTable$ = events$

    /** Filters don't need to be combined since they are applied per event and not to an Array. */
    .filter(pathEq(['entity', 'type'], 'linode'))
    .filter(pathSatisfies(initial => !initial, ['_initial']))
    .filter(pathSatisfies(isWhitelistedAction, ['action']))
    .filter(pathSatisfies(isWhitelistedStatus, ['status']))

    /**
     * @todo Describe concatMap functionality.
     * At this point we have an event we care about. We want to map that to a request for the
     * the Linode, update that in the resolution to be a LinodeWithRecentEvent.
     */
    .concatMap((event) => Observable.fromPromise(
      getLinode(event.entity!.id)
        .then(response => ({ ...response.data, recentEvent: event }))
    ))

    /**
     * Successive promises would destroy our "state", which is fine if we only have one event
     * at a time, but we can have multiple Linodes in a progress event status at a time. Scan
     * is just like reduce in that we get the new event, but still retain the last iteration.
     */
    .scan((updatingLinodeTable, updatingLinode) => ({
      ...updatingLinodeTable,
      [updatingLinode.id]: updatingLinode,
    }), {})

    /**
     * If we've filtered all the events out, we will never render. This will just send an empty
     * event which will have no side-effects.
     */
    .startWith({});

  return ownProps
    .combineLatest(
      updatingLinodesTable$,
      (props, updatingLinodeTable) => {
        const { data: linodes } = props;

        /** If there are no mounted linodes, just return the unmodifed props. */
        if (!linodes) { return props }

        /**
         * We're using map to find and replace the updating Linode. updatingLinode has the
         * recentEvent added in the promise resolution, so no need to do anything with it.
         *
         * What is returned here is spread to the underlying component.
         */
        return {
          ...props,
          data: linodes.map((linode) => updatingLinodeTable.hasOwnProperty(linode.id)
            ? updatingLinodeTable[linode.id]
            : linode
          ),
        };
      }
    )

    /** Dont emit a value unless it's different from the last. */
    .distinctUntilChanged();
});
