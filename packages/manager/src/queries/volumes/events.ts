import { accountQueries, volumeQueries } from '@linode/queries';

import type { EventHandlerData } from '@linode/queries';

/**
 * An event handler that performs invalidations based on incoming volume events.
 *
 * We use this to give users a realtime-like experience.
 */
export const volumeEventsHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    invalidateQueries({
      queryKey: volumeQueries.lists.queryKey,
    });

    if (event.entity) {
      invalidateQueries({
        queryKey: volumeQueries.volume(event.entity.id).queryKey,
      });
    }
  }

  if (
    event.action === 'volume_migrate' &&
    (event.status === 'finished' || event.status === 'failed')
  ) {
    // if a migration finishes, we want to re-request notifications so that the `volume_migration_imminent`
    // notification goes away.
    invalidateQueries({
      queryKey: accountQueries.notifications.queryKey,
    });
  }

  if (event.action === 'volume_clone') {
    // The API gives us no way to know when a cloned volume transitions from
    // creating to active, so we will just refresh after 10 seconds
    setTimeout(() => {
      invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });
    }, 10000);
  }
};
