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

    const newEvents = payload.filter(e => !e._initial);

    const len = newEvents.length
    let i = 0;

    for (; i < len; i++) {
      const event = newEvents[i];
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
