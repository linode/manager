import {
  EntityEvent,
  EventAction,
  EventStatus,
} from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';

import { AppEventHandler } from 'src/hooks/useAppEventHandlers';
import { queryKey as accountNotificationsQueryKey } from 'src/queries/accountNotifications';
import { ApplicationState } from 'src/store';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import { isEntityEvent } from 'src/utilities/eventUtils';

import { deleteLinode } from './linodes.actions';

import type { QueryClient } from 'react-query';

export const linodeStoreEventsHandler: AppEventHandler = (
  event,
  queryClient,
  store
) => {
  if (!isEntityEvent(event)) {
    return;
  }
  const {
    action,
    entity: { id },
    percent_complete,
    status,
  } = event;

  // We may want to request notifications here, depending on the event
  // action.
  if (shouldRequestNotifications(event)) {
    queryClient.invalidateQueries(accountNotificationsQueryKey);
  }

  switch (action) {
    /** Update Linode */
    case 'linode_migrate':
    case 'linode_migrate_datacenter':
    case 'linode_resize':
      return handleLinodeMigrate(store.dispatch, status, id, queryClient);
    case 'linode_reboot':
    case 'linode_shutdown':
    case 'linode_snapshot':
    case 'linode_addip':
    case 'linode_boot':
    case 'backups_enable':
    case 'backups_cancel':
    case 'disk_imagize':
    case 'linode_clone':
      return handleLinodeUpdate(store.dispatch, status, id);

    case 'linode_rebuild':
    case 'backups_restore':
      return handleLinodeRebuild(store.dispatch, status, id, percent_complete);

    /** Remove Linode */
    case 'linode_delete':
      return handleLinodeDelete(store.dispatch, status, id, store.getState());

    /** Create Linode */
    case 'linode_create':
      return handleLinodeCreation(store.dispatch, status, id);

    /**
     * Config actions
     *
     * It's not clear that these can actually fail, so this is here
     * mostly as a failsafe.
     */
    case 'linode_config_create':
    case 'linode_config_delete':
      return handleConfigEvent(store.dispatch, status, id);

    case 'disk_delete':
      if (status === 'failed') {
        /**
         * If a disk deletion fails (most likely because it is attached to
         * a configuration profile that is in use on a running Linode)
         * the disk menu needs to be refreshed to return the disk to it.
         */
        store.dispatch(getAllLinodeDisks({ linodeId: id }));
      }

    default:
      return;
  }
};

const handleLinodeRebuild = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  id: number,
  percent_complete: null | number
) => {
  /**
   * Rebuilding is a special case, because the rebuilt Linode
   * has new disks, which need to be updated in our store.
   */

  switch (status) {
    case 'notification':
    case 'scheduled':
    case 'started':
      if (percent_complete === 100) {
        // Get the new disks and update the store
        // This is a safety hatch in case the 'finished'
        // event doesn't come through.
        dispatch(getAllLinodeDisks({ linodeId: id }));
        dispatch(getAllLinodeConfigs({ linodeId: id }));
      }
      // Re-request Linode every poll iteration when rebuilding. This is due to
      // (buggy?) behavior in the API where a Linode's status isn't "rebuilding"
      // until late in the event's progress.
      // @todo: Make this handler like the others if/when the API bug is fixed.
      return dispatch(requestLinodeForStore(id));
    case 'finished':
    case 'failed':
      // Get the new disks and update the store.
      dispatch(getAllLinodeDisks({ linodeId: id }));
      dispatch(getAllLinodeConfigs({ linodeId: id }));
      return dispatch(requestLinodeForStore(id));
    default:
      return;
  }
};

const handleLinodeMigrate = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  id: number,
  queryClient: QueryClient
) => {
  dispatch(requestLinodeForStore(id, true));

  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
      // Once the migration/resize is done, we request notifications in order
      // to clear the Migration Imminent notification
      queryClient.invalidateQueries(accountNotificationsQueryKey);
      /**
       * After resizing, a Linode is booted (if it was booted before);
       * however, no boot event is sent. Additionally, the 'finished'
       * resize event is sent before this is complete. As a result,
       * the requestLinodeForStore below will often return a
       * status of 'offline', which will then not be updated.
       *
       * We send a follow-on request here to make sure the status is accurate.
       * 20 seconds is ridiculous but shorter timeouts still end up telling
       * us the Linode is offline.
       */
      setTimeout(() => dispatch(requestLinodeForStore(id, true)), 20000);
      return dispatch(requestLinodeForStore(id));
    default:
      return;
  }
};

const handleLinodeUpdate = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  id: number
) => {
  dispatch(requestLinodeForStore(id, true));

  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
      return dispatch(requestLinodeForStore(id, true));
    default:
      return;
  }
};

const handleLinodeDelete = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  id: number,
  state: ApplicationState
) => {
  const found = state.__resources.linodes.itemsById[id];

  if (!found) {
    return;
  }

  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(deleteLinode(id));

    default:
      return;
  }
};

const handleLinodeCreation = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  id: number
) => {
  dispatch(requestLinodeForStore(id, true));

  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
      return dispatch(requestLinodeForStore(id, true));

    default:
      return;
  }
};

const handleConfigEvent = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  id: number
) => {
  switch (status) {
    case 'failed':
      /**
       * We optimistically add or remove configs as soon
       * as the initial API request returns a 200.
       *
       * If we receive an event indicating that the creation/deletion
       * failed on the backend, we need to re-request this Linode's configs
       * (which will re-add or remove the target config).
       */
      return dispatch(getAllLinodeConfigs({ linodeId: id }));
    default:
      return;
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
export const shouldRequestNotifications = (event: EntityEvent) => {
  return (
    eventsWithRelevantNotifications.includes(event.action) &&
    ['error', 'finished', 'notification'].includes(event.status)
  );
};

const eventsWithRelevantNotifications: EventAction[] = [
  'linode_resize',
  'linode_resize_create',
  'linode_migrate',
  'linode_mutate',
  'linode_mutate_create',
  'linode_migrate_datacenter_create',
  'linode_migrate_datacenter',
];
