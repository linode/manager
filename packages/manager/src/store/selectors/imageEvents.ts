import { Event } from 'linode-js-sdk/lib/account';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import { isInProgressEvent } from 'src/store/events/event.helpers';

/**
 * Return a list of all in-progress
 * disk_imagize events where the event
 * is in progress and has a secondary_entity
 * (which will be the actual Image)
 */
export default createSelector<ApplicationState['events'], Event[], Event[]>(
  state => state.events || [],
  events =>
    events.filter(
      (thisEvent: Event) =>
        thisEvent.action === 'disk_imagize' &&
        !!thisEvent.secondary_entity &&
        isInProgressEvent(thisEvent)
    )
);
