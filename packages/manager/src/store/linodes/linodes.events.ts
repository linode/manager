import { EventAction, EventStatus } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { Dispatch } from 'redux';
import { ApplicationState } from 'src/store';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import { EventHandler } from 'src/store/types';
import { requestNotifications } from '../notification/notification.requests';
import { deleteLinode } from './linodes.actions';
import { parseAPIDate } from 'src/utilities/date';

const linodeEventsHandler: EventHandler = (event, dispatch, getState) => {
  const { action, entity, percent_complete, status, id: eventID } = event;
  const { id } = entity;

  // We may want to request notifications here, depending on the event
  // action, time of creation, and the last time we updated notifications.
  const { lastUpdated } = getState().__resources.notifications;

  if (shouldRequestNotifications(lastUpdated, event.action, event.created)) {
    dispatch(requestNotifications() as any);
  }

  const eventFromStore = getState().events.events.find(
    thisEvent => thisEvent.id === eventID
  );

  const prevStatus = eventFromStore?.status;

  switch (action) {
    /** Update Linode */
    case 'linode_migrate':
    case 'linode_migrate_datacenter':
    case 'linode_resize':
      return handleLinodeMigrate(dispatch, status, id, prevStatus);
    case 'linode_reboot':
    case 'linode_shutdown':
    case 'linode_snapshot':
    case 'linode_addip':
    case 'linode_boot':
    case 'backups_enable':
    case 'backups_cancel':
    case 'disk_imagize':
    case 'linode_clone':
      return handleLinodeUpdate(dispatch, status, id, prevStatus);

    case 'linode_rebuild':
    case 'backups_restore':
      return handleLinodeRebuild(
        dispatch,
        status,
        id,
        percent_complete,
        prevStatus
      );

    /** Remove Linode */
    case 'linode_delete':
      return handleLinodeDelete(dispatch, status, id, getState());

    /** Create Linode */
    case 'linode_create':
      return handleLinodeCreation(dispatch, status, id, prevStatus);

    /**
     * Config actions
     *
     * It's not clear that these can actually fail, so this is here
     * mostly as a failsafe.
     */
    case 'linode_config_create':
    case 'linode_config_delete':
      return handleConfigEvent(dispatch, status, id);

    case 'disk_delete':
      if (status === 'failed') {
        /**
         * If a disk deletion fails (most likely because it is attached to
         * a configuration profile that is in use on a running Linode)
         * the disk menu needs to be refreshed to return the disk to it.
         */
        dispatch(getAllLinodeDisks({ linodeId: id }));
      }

    default:
      return;
  }
};

export default linodeEventsHandler;

const handleLinodeRebuild = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  id: number,
  percent_complete: number | null,
  prevStatus?: EventStatus
) => {
  /**
   * Rebuilding is a special case, because the rebuilt Linode
   * has new disks, which need to be updated in our store.
   */

  // If this is the first "scheduled" event coming through for the Linode,
  // request it to update its status.
  if (status === 'scheduled' && !prevStatus) {
    return dispatch(requestLinodeForStore(id, true));
  }

  if (status === 'started' && percent_complete === 100) {
    // Get the new disks and update the store.
    dispatch(getAllLinodeDisks({ linodeId: id }));
    dispatch(getAllLinodeConfigs({ linodeId: id }));
    return dispatch(requestLinodeForStore(id));
  }

  switch (status) {
    case 'notification':
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
  prevStatus?: EventStatus
) => {
  // If this is the first "scheduled" event coming through for the Linode,
  // request it to update its status.
  if (status === 'scheduled' && !prevStatus) {
    return dispatch(requestLinodeForStore(id, true));
  }

  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
      // Once the migration/resize is done, we request notifications in order
      // to clear the Migration Imminent notification
      dispatch(requestNotifications());
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
  id: number,
  prevStatus?: EventStatus
) => {
  // If this is the first "scheduled" event coming through for the Linode,
  // request it to update its status.
  if (status === 'scheduled' && !prevStatus) {
    return dispatch(requestLinodeForStore(id, true));
  }

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
  id: number,
  prevStatus?: EventStatus
) => {
  // If this is the first "scheduled" event coming through for the Linode,
  // request it to update its status.
  if (status === 'scheduled' && !prevStatus) {
    return dispatch(requestLinodeForStore(id, true));
  }

  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
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
export const shouldRequestNotifications = (
  notificationsLastUpdated: number,
  lastEventAction?: EventAction,
  lastEventCreated?: string
) => {
  if (!lastEventAction || !lastEventCreated) {
    return false;
  }

  return (
    eventsWithRelevantNotifications.includes(lastEventAction) &&
    // if the event was created after the last time notifications were updated
    parseAPIDate(lastEventCreated) >
      DateTime.fromMillis(notificationsLastUpdated, { zone: 'utc' })
  );
};

const eventsWithRelevantNotifications: EventAction[] = [
  'linode_resize',
  'linode_resize_create',
  'linode_migrate',
  'linode_mutate',
  'linode_mutate_create',
  'linode_migrate_datacenter_create',
  'linode_migrate_datacenter'
];
