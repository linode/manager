import { accountQueries } from '../account/queries';
import { volumeQueries } from './volumes';

import type { EventHandlerData } from 'src/hooks/useEventHandlers';

/**
 * An event handler that performs invalidations based on incoming volume events.
 *
 * We use this to give users a realtime-like experience.
 */
export const volumeEventsHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    queryClient.invalidateQueries({
      queryKey: volumeQueries.lists.queryKey,
    });
  }

  if (
    event.action === 'volume_migrate' &&
    (event.status === 'finished' || event.status === 'failed')
  ) {
    // if a migration finishes, we want to re-request notifications so that the `volume_migration_imminent`
    // notification goes away.
    queryClient.invalidateQueries({
      queryKey: accountQueries.notifications.queryKey,
    });
  }

  if (event.action === 'volume_clone') {
    // The API gives us no way to know when a cloned volume transitions from
    // creating to active, so we will just refresh after 10 seconds
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });
    }, 10000);
  }
};
