import { Dispatch } from 'redux';
import { EventHandler } from '../middleware/combineEventsMiddleware';
import { deleteVolumeActions } from './volume.actions';
import { getOneVolume } from './volume.requests';

const volumeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'volume_attach':
    case 'volume_detach':
    case 'volume_create':
    case 'volume_resize':
      return handleVolumeUpdate(dispatch, status, id);

    // case 'volume_clone':
    //   return handleVolumeClone(dispatch, status, id);

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

// SEE COMMENT IN ./volume.reducer.ts
// The entity coming through on this event is the SOURCE volume, NOT THE DESTINATION volume. Ideally this is where
// we would have hardcoded the "active" status, but since we don't know the destination volume, we have to do
// it in the reducer.
// const handleVolumeClone = (dispatch: Dispatch<any>, status: Linode.EventStatus, volumeId: number) => {
//   switch (status) {
//     case 'finished':
//     case 'notification':
//     case 'failed':
//     case 'scheduled':
//     case 'started':
//     default:
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

export default volumeEventsHandler;
