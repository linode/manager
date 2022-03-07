import { EventStatus } from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';
import { EventHandler } from 'src/store/types';
import { getAllLinodeDisks } from './disk.requests';

const diskEventHandler: EventHandler = (event, dispatch, getState) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'disk_create':
    case 'disk_delete':
    case 'disk_resize':
      return handleDiskChange(dispatch, status, id);

    default:
      return;
  }
};

export default diskEventHandler;

const handleDiskChange = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  linodeId: number
) => {
  switch (status) {
    case 'finished':
    case 'notification':
    case 'failed':
      return dispatch(getAllLinodeDisks({ linodeId }));

    case 'scheduled':
    case 'started':
    default:
      return;
  }
};
