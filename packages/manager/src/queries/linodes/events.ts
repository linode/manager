import {
  accountQueries,
  firewallQueries,
  linodeQueries,
  volumeQueries,
} from '@linode/queries';

import type { Event } from '@linode/api-v4';
import type { EventHandlerData } from '@linode/queries';

/**
 * Event handler for Linode events
 *
 * This event handler runs for any event prefixed with "linode".
 * For example, "linode_create", "linode_boot", "linode_resize", ...
 */
export const linodeEventsHandler = ({
  event,
  invalidateQueries,
  queryClient,
}: EventHandlerData) => {
  const linodeId = event.entity?.id;

  // Early return to cut down the number of invalidations.
  // We early return if the event is "started" or "scheduled" beacuse we don't need to
  // invalidate things when they are in progress and their percentage complete is actively updating.
  // If we didn't early return, the invalidations would happen every time an event's percentage updates.
  if (!linodeId || ['scheduled', 'started'].includes(event.status)) {
    return;
  }

  // Some Linode events are an indication that the reponse from /v4/account/notifications
  // has changed, so refetch notifications.
  if (shouldRequestNotifications(event)) {
    invalidateQueries(accountQueries.notifications);
  }

  switch (event.action) {
    case 'linode_addip':
    case 'linode_deleteip':
      invalidateQueries(linodeQueries.linodes);
      invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
      });
      invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      return;
    case 'linode_boot':
    case 'linode_shutdown':
      invalidateQueries(linodeQueries.linodes);
      invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      // Ensure configs are fresh when Linode is booted up (see https://github.com/linode/manager/pull/9914)
      invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.configs.queryKey,
      });
      return;
    case 'linode_clone':
    case 'linode_create':
      invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.disks.queryKey,
      });
      invalidateQueries(linodeQueries.linodes);
      invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      return;
    case 'linode_config_create':
    case 'linode_config_delete':
    case 'linode_config_update':
      invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.configs.queryKey,
      });
      return;
    case 'linode_delete':
      queryClient.removeQueries({
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      // A Linode made have been on a Firewall's device list, but now that it is deleted,
      // it will no longer be listed as a device on that firewall. Here, we invalidate outdated firewall data.
      invalidateQueries({ queryKey: firewallQueries._def });
      // A Linode may have been attached to a Volume, but deleted. We need to refetch volumes data so that
      // the Volumes table does not show a Volume attached to a non-existant Linode.
      invalidateQueries({ queryKey: volumeQueries.lists.queryKey });
      return;
    case 'linode_migrate':
    case 'linode_migrate_datacenter':
    case 'linode_migrate_datacenter_create':
    case 'linode_mutate':
    case 'linode_mutate_create':
    case 'linode_reboot':
    case 'linode_resize':
    case 'linode_resize_create':
    case 'linode_resize_warm_create':
    case 'linode_update':
      invalidateQueries(linodeQueries.linodes);
      invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      return;
    case 'linode_rebuild':
      invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.disks.queryKey,
      });
      invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.configs.queryKey,
      });
      invalidateQueries(linodeQueries.linodes);
      invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      return;
    case 'linode_snapshot':
      invalidateQueries(linodeQueries.linodes);
      invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      invalidateQueries(linodeQueries.linode(linodeId)._ctx.backups);
      return;
  }
};

/**
 * Event handler for Disk events.
 *
 * Disks have their own handler beacuse the actions are not prefixed with "linode_".
 * They are prefixed with "disk_". For example "disk_create" or "disk_delete".
 */
export const diskEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  const linodeId = event.entity?.id;

  if (!linodeId || ['scheduled', 'started'].includes(event.status)) {
    return;
  }

  invalidateQueries({
    queryKey: linodeQueries.linode(linodeId)._ctx.disks.queryKey,
  });
};

export const interfaceEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  // For Interface events, the `entity` is the Interface and the `secondary_entity` is the Linode.

  if (event.secondary_entity) {
    invalidateQueries({
      queryKey: linodeQueries.linode(event.secondary_entity.id)._ctx.interfaces
        .queryKey,
    });
  }
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
  'linode_resize_warm_create',
  'linode_migrate',
  'linode_mutate',
  'linode_mutate_create',
  'linode_migrate_datacenter_create',
  'linode_migrate_datacenter',
];
