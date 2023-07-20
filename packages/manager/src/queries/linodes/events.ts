import { AppEventHandler } from 'src/hooks/useAppEventHandlers';

import { queryKey } from './linodes';

export const linodeEventsHandler: AppEventHandler = (_, queryClient) => {
  // For now, invalidate any linode query. We can fine tune later.
  queryClient.invalidateQueries([queryKey]);
};

export const diskEventHandler: AppEventHandler = (event, queryClient, _) => {
  const linodeId = event.entity?.id;

  if (
    !linodeId ||
    !['failed', 'finished', 'notification'].includes(event.status)
  ) {
    return;
  }

  queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
};
