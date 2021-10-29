import { EventStatus } from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';
import { EventHandler } from 'src/store/types';
import { deleteVolumeActions } from './volume.actions';
import { getAllVolumes, getOneVolume } from './volume.requests';

const volumeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status, percent_complete } = event;
  const { id } = entity;

  switch (action) {
    case 'volume_create':
    case 'volume_attach':
    case 'volume_update':
    case 'volume_detach':
    case 'volume_resize':
      return handleVolumeUpdate(dispatch, status, id);

    case 'volume_clone':
      return handleVolumeClone(dispatch, status);

    case 'volume_delete':
      return handleVolumeDelete(dispatch, status, id);

    case 'volume_migrate':
      return handleVolumeMigrate(dispatch, status, percent_complete);

    default:
      return;
  }
};

const handleVolumeUpdate = (
  dispatch: Dispatch<any>,
  status: EventStatus,
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

const handleVolumeClone = (dispatch: Dispatch<any>, status: EventStatus) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      // We can't just get the cloned volume, since the entity on volume_clone events is the PARENT
      // (so we don't know the correct volumeId to GET). Therefore, we need to get ALL volumes,
      // but we don't want to see a loading state – we want this to happen in the "background".
      dispatch(getAllVolumes({ setLoading: false }));

    default:
      return;
  }
};

const handleVolumeDelete = (
  dispatch: Dispatch<any>,
  status: EventStatus,
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
        result: {},
      });
      return dispatch(action);
  }
};

const handleVolumeMigrate = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  percent_complete: number | null
) => {
  switch (status) {
    case 'started':
    case 'finished':
      if (percent_complete === 100) {
        dispatch(getAllVolumes({ setLoading: false }));
      }
    case 'failed':
    case 'notification':
    case 'scheduled':

    default:
      return;
  }
};

export default volumeEventsHandler;
