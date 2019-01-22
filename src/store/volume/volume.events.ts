import { Dispatch } from 'redux';
import { EventHandler } from '../middleware/combineEventsMiddleware';
import { deleteVolumeActions, updateVolumeInStore } from './volume.actions';
import { getOneVolume } from './volume.requests';

const volumeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'volume_create':
    case 'volume_attach':
    case 'volume_detach':
    return handleVolumeUpdate(dispatch, status, id);

    case 'volume_resize':
      return handleVolumeResize(dispatch, status, id);

    // case 'volume_clone':
      // return handleVolumeClone(dispatch, status, id);

    case 'volume_delete':
      return handleVolumeDelete(dispatch, status, id);

    default:
      return;
  }
}

const handleVolumeUpdate = (dispatch: Dispatch<any>, status: Linode.EventStatus, volumeId: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      dispatch(getOneVolume({ volumeId }));

    default:
      return;
  }
}

const handleVolumeResize = (dispatch: Dispatch<any>, status: Linode.EventStatus, volumeId: number) => {
  switch (status) {

    // Similarly to cloning volumes, we don't get progress events on resizing, so we have to artificially set the
    // status to "active" here, or else the volume could potentially be in an "resizing" state until the next
    // getAllVolumes request.
    case 'notification':
      updateVolumeStatus(dispatch, volumeId, 'active');

    default:
      return;
  }
}

// SEE COMMENT IN ./volume.reducer.ts
// The entity coming through on this event is the SOURCE volume, NOT THE DESTINATION volume. Ideally this is where
// we would have hardcoded the "active" status, but since we don't know the destination volume, we have to do
// it in the reducer. The problem with requesting all volumes here, is that the volume will still be "creating".
// const handleVolumeClone = (dispatch: Dispatch<any>, status: Linode.EventStatus, volumeId: number) => {
//   switch (status) {
//     case 'finished':
//     case 'notification':
//     case 'failed':
//     case 'scheduled':
//     case 'started':
//       return dispatch(getAllVolumes());

//       default:
//       return;
//   }
// };

const handleVolumeDelete = (dispatch: Dispatch<any>, status: Linode.EventStatus, volumeId: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      const action = deleteVolumeActions.done({
        params: { volumeId },
        result: {}
      });
      return dispatch(action);
  }
}

export const updateVolumeStatus = (dispatch: Dispatch<any>, volumeId: number, status: Linode.VolumeStatus) => {
  const action = updateVolumeInStore({
    volumeId,
    update: (existing) => ({ ...existing, status })
  });
  dispatch(action);
}

export default volumeEventsHandler;