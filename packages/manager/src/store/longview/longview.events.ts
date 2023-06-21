import { EventStatus } from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';
import { AppEventHandler } from 'src/hooks/useAppEventHandlers';
import { isEntityEvent } from '../events/event.helpers';
import { getAllLongviewClients } from './longview.requests';

export const longviewEventHandler: AppEventHandler = (event, _, store) => {
  if (!isEntityEvent(event)) {
    return;
  }
  const { action, status } = event;

  switch (action) {
    case 'longviewclient_create':
    case 'longviewclient_delete':
    case 'longviewclient_update':
      return handleClientChange(store.dispatch, status);

    default:
      return;
  }
};

const handleClientChange = (dispatch: Dispatch<any>, status: EventStatus) => {
  switch (status) {
    case 'finished':
    case 'notification':
      return dispatch(getAllLongviewClients({}));

    case 'failed':
    case 'scheduled':
    case 'started':
    default:
      return;
  }
};
