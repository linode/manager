import { EventWithStore } from 'src/events';

import { queryKey } from './linodes';

export const linodeEventsHandler = ({ event, queryClient }: EventWithStore) => {
  // For now, invalidate any linode query. We can fine tune later.
  queryClient.invalidateQueries([queryKey]);
};

export const diskEventHandler = ({ event, queryClient }: EventWithStore) => {
  const linodeId = event.entity?.id;

  if (
    !linodeId ||
    !['failed', 'finished', 'notification'].includes(event.status)
  ) {
    return;
  }

  queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
};
