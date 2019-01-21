import { Dispatch } from 'redux';
import { EventHandler } from '../middleware/combineEventsMiddleware';
import { getOneVolume } from './volume.requests';

const volumeEventsHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'volume_attach':
    case 'volume_detach':
      return handleVolumeUpdate(dispatch, status, id);
  }
}

const handleVolumeUpdate = (dispatch: Dispatch<any>, status: Linode.EventStatus, id: number) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      dispatch(getOneVolume({ volumeId: id }));

    default:
      return;
  }
}

export default volumeEventsHandler;