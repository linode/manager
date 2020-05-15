import { EventStatus } from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';
import { EventHandler } from 'src/store/types';
import { getAllLinodeConfigs } from './config.requests';

const configEventHandler: EventHandler = (event, dispatch) => {
  const { action, entity, status } = event;
  const { id } = entity;

  switch (action) {
    case 'linode_config_create':
    case 'linode_config_delete':
    case 'linode_config_update':
      return handleConfigChange(dispatch, status, id);

    default:
      return;
  }
};

export default configEventHandler;

const handleConfigChange = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  linodeId: number
) => {
  switch (status) {
    case 'finished':
    case 'notification':
    case 'failed':
      return dispatch(getAllLinodeConfigs({ linodeId }));

    case 'scheduled':
    case 'started':
    default:
      return;
  }
};
