import { EventStatus } from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';

import { AppEventHandler } from 'src/hooks/useAppEventHandlers';
import { isEntityEvent } from 'src/utilities/eventUtils';

import { getAllLinodeConfigs } from './config.requests';

export const configEventHandler: AppEventHandler = (event, _, store) => {
  if (!isEntityEvent(event)) {
    return;
  }
  const {
    action,
    entity: { id },
    status,
  } = event;

  switch (action) {
    case 'linode_config_create':
    case 'linode_config_delete':
    case 'linode_config_update':
      return handleConfigChange(store.dispatch, status, id);

    default:
      return;
  }
};

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
