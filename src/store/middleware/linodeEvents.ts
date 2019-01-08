import { Dispatch } from 'redux';
import { removeLinodeFromStore, updateLinodeInStore } from 'src/store/linodes/linodes.actions';
import { requestGetOneLinode } from 'src/store/linodes/linodes.requests';
import { EventHandler } from './combineEventsMiddleware';

const linodeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    /** Update Linode */

    case 'linode_rebuild':
    case 'linode_snapshot':
    case 'linode_addip':
      return handleLinodeUpdate(dispatch, status, id);

    case 'linode_migrate':
      return handleLinodeMigrate(dispatch, status, id);

    case 'linode_reboot':
      return handleLinodeReboot(dispatch, status, id);

    case 'linode_shutdown':
      return handleLinodeShutdown(dispatch, status, id);

    case 'linode_boot':
      return handleLinodeBoot(dispatch, status, id);

    case 'linode_resize':
      return handleLinodeResize(dispatch, status, id);

    case 'linode_clone':
      return handleLinodeClone(dispatch, status, id);

    case 'linode_delete':
      return handleLinodeDelete(dispatch, status, id)

    case 'linode_create':
      return handleLinodeCreation(dispatch, status, id);

    default:
      return;
  }
};

export default linodeEventsHandler;

const updateLinodeStatus = (dispatch: Dispatch<any>, id: number, status: Linode.LinodeStatus) => {
  const action = updateLinodeInStore({
    id,
    update: (existing) => ({ ...existing, status }),
  });

  dispatch(action);
};

const handleLinodeMigrate = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
      dispatch(requestGetOneLinode({ id }));

    case 'scheduled':
    case 'started':
      return updateLinodeStatus(dispatch, id, 'migrating');

    default:
      return;
  }
};

const handleLinodeClone = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
      dispatch(requestGetOneLinode({ id }));

    case 'scheduled':
    case 'started':
      return updateLinodeStatus(dispatch, id, 'cloning');

    default:
      return;
  }
};

const handleLinodeShutdown = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
      dispatch(requestGetOneLinode({ id }));

    case 'scheduled':
    case 'started':
      return updateLinodeStatus(dispatch, id, 'shutting_down');

    default:
      return;
  }
};

const handleLinodeReboot = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
      dispatch(requestGetOneLinode({ id }));

    case 'scheduled':
    case 'started':
      return updateLinodeStatus(dispatch, id, 'rebooting');

    default:
      return;
  }
};

const handleLinodeBoot = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
      dispatch(requestGetOneLinode({ id }));

    case 'scheduled':
    case 'started':
      return updateLinodeStatus(dispatch, id, 'booting');

    default:
      return;
  }
};

const handleLinodeResize = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
      dispatch(requestGetOneLinode({ id }));

    case 'scheduled':
    case 'started':
      return updateLinodeStatus(dispatch, id, 'resizing');

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
      return dispatch(requestGetOneLinode({ id }));

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
      return dispatch(removeLinodeFromStore(id));

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
      return dispatch(requestGetOneLinode({ id }));

    default:
      return;
  }
}
