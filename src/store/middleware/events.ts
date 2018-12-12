import { compose, equals, uniqWith } from 'ramda';
import { Dispatch, Middleware } from 'redux';
import { resetEventsPolling } from 'src/events';
import { isInProgressEvent } from 'src/store/reducers/events';
import { isType } from 'typescript-fsa';
import { addEvents } from '../reducers/events';
import { actions, async } from '../reducers/resources/linodes';

const { deleteLinode } = actions;
const { requestLinodeForStore } = async;

const middleware: Middleware = ({ dispatch }) => (next: Dispatch<any>) => (action: any) => {
  if (isType(action, addEvents)) {
    const { payload } = action;

    const eventsToDispatch = compose(uniqueEntityEvents, filterInitial)(payload);

    const len = eventsToDispatch.length
    let i = 0;

    for (; i < len; i++) {
      const event = eventsToDispatch[i];
      responseToEvent(dispatch, event);
    }
  }

  next(action);
};

export default middleware;

/** To keep the event stream moving quickly during progressive events. */
const resetEventsPollingForInProgressEvents = (e: Linode.Event) => {
  if (isInProgressEvent(e)) {
    resetEventsPolling();
  }
}

const responseToEvent = (dispatch: Dispatch<any>, event: Linode.Event) => {
  const { action, entity, status } = event;

  if (!entity) {
    return;
  }

  const { id } = entity;

  resetEventsPollingForInProgressEvents(event);

  switch (action) {

    /** Update Linode */
    case 'linode_migrate':
    case 'linode_reboot':
    case 'linode_rebuild':
    case 'linode_shutdown':
    case 'linode_snapshot':
    case 'linode_addip':
    case 'linode_boot':
      return handleLinodeUpdate(dispatch, status, id);

    /** Remove Linode */
    case 'linode_delete':
      return handleLinodeDelete(dispatch, status, id)

    /** Create Linode */
    case 'linode_create':
    case 'linode_clone':
      return handleLinodeCreation(dispatch, status, id);

    default:
      return;
  }
};

const handleLinodeUpdate = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestLinodeForStore(id));

    default:
      return;
  }
};

const handleLinodeDelete = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(deleteLinode(id));

    default:
      return;
  }
}
const handleLinodeCreation = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestLinodeForStore(id));

    default:
      return;
  }
}

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
  uniqWith<ExtendedEvent, ExtendedEvent>((left, right) => equals(left.entity, right.entity)),
  (e: ExtendedEvent[]) => e.reverse(),
);

const filterInitial = (events: ExtendedEvent[]) => events.filter(e => !e._initial);
