import { AppEventHandler } from 'src/hooks/useAppEventHandlers';
import { queryKey as accountNotificationsQueryKey } from 'src/queries/accountNotifications';

import { queryKey } from './linodes';

import type { Event } from '@linode/api-v4';

/**
 * Event handler for Linode events
 *
 * This event handler runs for any event prefixed with "linode".
 * For example, "linode_create", "linode_boot", "linode_resize", ...
 */
export const linodeEventsHandler: AppEventHandler = (event, queryClient) => {
  const linodeId = event.entity?.id;

  // Early return to cut down the number of invalidations.
  // We early return if the event is "started" or "scheduled" beacuse we don't need to
  // invaldate things when they are in progress and their percentage complete is activly updating.
  // If we didn't early return, the invalidations would happen every time an event's percentage updates.
  if (!linodeId || ['scheduled', 'started'].includes(event.status)) {
    return;
  }

  // Some Linode event are in indication that the reponse from /v4/account/notifications
  // has changed, so refetch notifications.
  if (shouldRequestNotifications(event)) {
    queryClient.invalidateQueries(accountNotificationsQueryKey);
  }

  switch (event.action) {
    case 'linode_migrate':
    case 'linode_migrate_datacenter':
    case 'linode_resize':
    case 'linode_reboot':
    case 'linode_boot':
    case 'linode_shutdown':
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'details']);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      return;
    case 'linode_snapshot':
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'backups']);
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'details']);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      return;
    case 'linode_addip':
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'ips']);
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'details']);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      return;
    case 'linode_create':
    case 'linode_clone':
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      return;
    case 'linode_rebuild':
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'configs']);
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'details']);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      return;
    case 'linode_delete':
      queryClient.removeQueries([queryKey, 'linode', linodeId]);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      return;
    case 'linode_config_create':
    case 'linode_config_delete':
      queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'configs']);
      return;
  }
};

/**
 * Event handler for Disk events.
 *
 * Disks have their own handler beacuse the actions are not prefixed with "linode_".
 * They are prefixed with "disk_". For example "disk_create" or "disk_delete".
 */
export const diskEventHandler: AppEventHandler = (event, queryClient, _) => {
  const linodeId = event.entity?.id;

  if (!linodeId || ['scheduled', 'started'].includes(event.status)) {
    return;
  }

  queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'disks']);
};

/**
 * shouldRequestNotifications
 *
 * We may want to request notifications upon receiving an event, depending on the
 * type of the event, and the last time we requested notifications.
 *
 * EXAMPLE:
 *
 * 1) User clicks "Resize Linode"
 * 2) There is now a `migration_imminent` notification on the Linode.
 * 3) In the next few minutes, the resize is kicked off.
 * 4) The `migration_imminent` notification on the Linode goes away.
 */
export const shouldRequestNotifications = (event: Event) => {
  return (
    eventsWithRelevantNotifications.includes(event.action) &&
    ['error', 'finished', 'notification'].includes(event.status)
  );
};

const eventsWithRelevantNotifications = [
  'linode_resize',
  'linode_resize_create',
  'linode_migrate',
  'linode_mutate',
  'linode_mutate_create',
  'linode_migrate_datacenter_create',
  'linode_migrate_datacenter',
];
