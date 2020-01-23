import { EventStatus } from 'linode-js-sdk/lib/account';
import { Dispatch } from 'redux';
import { EventHandler } from 'src/store/types';
import { getAllLongviewClients } from './longview.requests';

const longviewEventHandler: EventHandler = (event, dispatch, getState) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'longviewclient_create':
    case 'longviewclient_delete':
    case 'longviewclient_update':
      return handleClientChange(dispatch, status, id);

    default:
      return;
  }
};

export default longviewEventHandler;

const handleClientChange = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  linodeId: number
) => {
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
