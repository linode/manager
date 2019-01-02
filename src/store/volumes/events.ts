import { Dispatch } from 'redux';
import { EventHandler } from '../middleware/combineEventsMiddleware';
import { actions } from './actions';
import { async } from './async';

const { deleteVolume } = actions;
const { requestVolumeForStore } = async;

const volumeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {

    /** Update Volume */
    case 'volume_attach':
    case 'volume_detach':
      return handleVolumeUpdate(dispatch, status, id);

    /** Remove Volume */
    case 'volume_delete':
      return handleVolumeDelete(dispatch, status, id)

    /** Create Volume */
    case 'volume_create':
      return handleVolumeCreation(dispatch, status, id);

    default:
      return;
  }
};

export default volumeEventsHandler;

const handleVolumeUpdate = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestVolumeForStore(id));

    default:
      return;
  }
};

const handleVolumeDelete = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(deleteVolume(id));

    default:
      return;
  }
}

const handleVolumeCreation = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestVolumeForStore(id));

    default:
      return;
  }
}
