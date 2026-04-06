import { accountQueries, linodeQueries, volumeQueries } from '@linode/queries';

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

    // `event.entity` is the Volume
    if (event.entity) {
      invalidateQueries({
        queryKey: volumeQueries.volume(event.entity.id).queryKey,
      });
    }

    // `event.secondary_entity` will be a Linode when the event is a Volume attach / detach event
    if (event.secondary_entity) {
      // Invalidate the Linode's paginated list of volumes to ensure the list is up to date
      invalidateQueries({
        queryKey: volumeQueries.linode(event.secondary_entity.id)._ctx.volumes
          ._def,
      });
      // Invalidate the Linode's configs because config storage devices may be updated when an attach/detach happens
      invalidateQueries({
        queryKey: linodeQueries.linode(event.secondary_entity.id)._ctx.configs
          .queryKey,
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
