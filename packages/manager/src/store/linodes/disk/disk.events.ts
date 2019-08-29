import { EventStatus } from 'linode-js-sdk/lib/account';
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
      return dispatch(getAllLinodeDisks({ linodeId }));

    case 'failed':
    case 'scheduled':
    case 'started':
    default:
      return;
  }
};
