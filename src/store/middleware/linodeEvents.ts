import { Dispatch } from 'redux';
import { actions, async } from '../reducers/resources/linodes';
import { EventHandler } from './combineEventsMiddleware';

const { deleteLinode } = actions;
const { requestLinodeForStore } = async;

const linodeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {

    /** Update Linode */
    case 'linode_migrate':
    case 'linode_reboot':
    case 'linode_rebuild':
    case 'linode_shutdown':
    case 'linode_snapshot':
    case 'linode_addip':
    case 'linode_boot':
    case 'linode_resize':
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

export default linodeEventsHandler;

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
