import { compose, equals, uniqWith } from 'ramda';
import { Middleware } from 'redux';
import { resetEventsPolling } from 'src/events';
import {
  isEntityEvent,
  isInProgressEvent
} from 'src/store/events/event.helpers';
import { EventHandler } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { addEvents } from '../events/event.actions';
import { ExtendedEvent } from '../events/event.helpers';

const eventsMiddlewareFactory = (
  ...eventHandlers: EventHandler[]
): Middleware => ({ dispatch, getState }) => next => (action: any) => {
  if (isType(action, addEvents)) {
    const { payload } = action;
    /**
     * We never want to dispatch actions for intial events, so filter them out.
     * We also need to only deal with one event per entity at a time, so uniqueEntityEvents
     * handles filtering for unique events. Notably linode_create/linode_boot and others.
     */
    const eventsToDispatch = compose(
      uniqueEntityEvents,
      filterInitial
    )(payload);

    /**
     * The incoming events is an array, usually of one but potentially many, so we have
     * to handle each one.
     */
    for (const event of eventsToDispatch) {
      /**
       * We can bail immediately if there is no associated entity since we need an entity
       * to update the store.
       *
       * but we still need to dispatch the action to add the event to the store
       */
      if (!isEntityEvent(event)) {
        next(action);
        return;
      }

      /**
       * Having an event we care about, we can call the handlers with the event and dispatch.
       */
      for (const handler of eventHandlers) {
        handler(event, dispatch, getState);
      }

      /**
       * Finally, if any of these events were in-progress we want to reset the events polling
       * interval to keep things moving quickly.
       */
      if (isInProgressEvent(event)) {
        // If the event is in_progress, we poll more aggressively
        resetEventsPolling();
      }
    }
  }

  next(action);
};

export default eventsMiddlewareFactory;

/**
 * When creating a Linode with an image you get a [ linode_create, linode_boot ] (in order).
 * When deleting a Linode (always) you get a [ linode_shutdown, linode_delete ] (in order).
 * Here we're taking the first event unique to the entity, so we will never experience
 * multiple events being dispatched for a single entity.
 *
 * We reverse because events come back in reverse order and want the first (boot and delete).
 *
 * The better user exp during deletion would be to see the shutdown, then the delete, but we
 * cant poll for the deleted Linode's status because it's no longer availalbe from the API.
 */
const uniqueEntityEvents = compose(
  (e: ExtendedEvent[]) => e.reverse(),
  uniqWith<ExtendedEvent, ExtendedEvent>((left, right) =>
    equals(left.entity, right.entity)
  ),
  (e: ExtendedEvent[]) => e.reverse()
);

const filterInitial = (events: ExtendedEvent[]) =>
  events.filter(e => !e._initial);
