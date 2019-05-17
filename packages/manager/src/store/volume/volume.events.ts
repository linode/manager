import { Dispatch } from 'redux';
import { EventHandler } from 'src/store/types';
import { deleteVolumeActions } from './volume.actions';
import { getAllVolumes, getOneVolume } from './volume.requests';

const volumeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'volume_create':
    case 'volume_attach':
    case 'volume_detach':
    case 'volume_resize':
      return handleVolumeUpdate(dispatch, status, id);

    case 'volume_clone':
      return handleVolumeClone(dispatch, status);

    case 'volume_delete':
      return handleVolumeDelete(dispatch, status, id);

    default:
      return;
  }
};

const handleVolumeUpdate = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  volumeId: number
) => {
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
};

const handleVolumeClone = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus
) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      // We can't just get the cloned volume, since the entity on volume_clone events is the PARENT
      // (so we don't know the correct volumeId to GET). Therefore, we need to get ALL volumes,
      // but we don't want to see a loading state – we want this to happen in the "background".
      dispatch(getAllVolumes({ shouldSetLoading: false }));

    default:
      return;
  }
};

const handleVolumeDelete = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  volumeId: number
) => {
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
};

export default volumeEventsHandler;
