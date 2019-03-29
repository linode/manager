import { Dispatch } from 'redux';
import { ApplicationState } from 'src/store';
import { EventHandler } from 'src/store/types';
import { requestNotifications } from '../notification/notification.requests';
import {
  deleteLinode,
  requestLinodeForStore,
  updateLinode
} from './linodes.actions';

const linodeEventsHandler: EventHandler = (event, dispatch, getState) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    /** Update Linode */
    case 'linode_migrate':
    case 'linode_resize':
      return handleLinodeMigrate(dispatch, status, id);
    case 'linode_reboot':
    case 'linode_rebuild':
    case 'linode_shutdown':
    case 'linode_snapshot':
    case 'linode_addip':
    case 'linode_boot':
    case 'backups_restore':
    case 'backups_enable':
    case 'backups_cancel':
    case 'disk_imagize':
      return handleLinodeUpdate(dispatch, status, id);

    /** Remove Linode */
    case 'linode_delete':
      return handleLinodeDelete(dispatch, status, id, getState());

    /** Create Linode */
    case 'linode_create':
      return handleLinodeCreation(dispatch, status, id, getState());

    case 'linode_clone':
      return handleLinodeClone(dispatch, status, id);

    default:
      return;
  }
};

export default linodeEventsHandler;

const handleLinodeMigrate = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number
) => {
  switch (status) {
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestLinodeForStore(id));

    case 'finished':
    case 'failed':
      // Once the migration/resize is done, we request notifications in order
      // to clear the Migration Imminent notification
      dispatch(requestNotifications());
      return dispatch(requestLinodeForStore(id));
    default:
      return;
  }
};

const handleLinodeClone = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number
) => {
  switch (status) {
    case 'failed':
    case 'finished':
      return dispatch(requestLinodeForStore(id));

    case 'scheduled':
    case 'started':
      const action = updateLinode({
        id,
        update: existing => ({ ...existing, status: 'cloning' })
      });

      return dispatch(action);

    default:
      return;
  }
};

const handleLinodeUpdate = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number
) => {
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

const handleLinodeDelete = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number,
  state: ApplicationState
) => {
  const found = state.__resources.linodes.results.find(i => i === id);

  if (!found) {
    return;
  }

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
};

const handleLinodeCreation = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number,
  state: ApplicationState
) => {
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
