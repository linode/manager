import { EventStatus } from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';
import { AppEventHandler } from 'src/hooks/useAppEventHandlers';
import { isEntityEvent } from 'src/store/events/event.helpers';
import { getAllLinodeDisks } from './disk.requests';

export const diskEventHandler: AppEventHandler = (event, _, store) => {
  if (!isEntityEvent(event)) {
    return;
  }
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'disk_create':
    case 'disk_delete':
    case 'disk_resize':
      return handleDiskChange(store.dispatch, status, id);

    default:
      return;
  }
};

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
