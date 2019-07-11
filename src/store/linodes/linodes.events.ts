import * as moment from 'moment';
import { Dispatch } from 'redux';
import { ApplicationState } from 'src/store';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import { EventHandler } from 'src/store/types';
import { requestNotifications } from '../notification/notification.requests';
import { deleteLinode, updateLinode } from './linodes.actions';

const linodeEventsHandler: EventHandler = (event, dispatch, getState) => {
  const { action, entity, status } = event;
  const { id } = entity;

  // We may want to request notifications here, depending on the event
  // action, time of creation, and the last time we updated notifications.
  const { lastUpdated } = getState().__resources.notifications;

  if (shouldRequestNotifications(lastUpdated, event.action, event.created)) {
    dispatch(requestNotifications() as any);
  }

  switch (action) {
    /** Update Linode */
    case 'linode_migrate':
    case 'linode_resize':
      return handleLinodeMigrate(dispatch, status, id);
    case 'linode_reboot':
    case 'linode_rebuild':
    case 'linode_shutdown':
    case 'linode_snapshot':
    case 'linode_addip':
    case 'linode_boot':
    case 'backups_restore':
    case 'backups_enable':
    case 'backups_cancel':
    case 'disk_imagize':
    case 'linode_clone':
      return handleLinodeUpdate(dispatch, status, id);

    /** Remove Linode */
    case 'linode_delete':
      return handleLinodeDelete(dispatch, status, id, getState());

    /** Create Linode */
    case 'linode_create':
      return handleLinodeCreation(dispatch, status, id, getState());

    default:
      return;
  }
};

export default linodeEventsHandler;

const handleLinodeMigrate = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number
) => {
  switch (status) {
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestLinodeForStore(id));

    case 'finished':
    case 'failed':
      // Once the migration/resize is done, we request notifications in order
      // to clear the Migration Imminent notification
      dispatch(requestNotifications());
      return dispatch(requestLinodeForStore(id));
    default:
      return;
  }
};

const handleLinodeUpdate = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number
) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestLinodeForStore(id));

    default:
      return;
  }
};

const handleLinodeDelete = (
  dispatch: Dispatch<any>,
  status: Linode.EventStatus,
  id: number,
  state: ApplicationState
) => {
  const found = state.__resources.linodes.results.find(i => i === id);

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
  status: Linode.EventStatus,
  id: number,
  state: ApplicationState
) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      return dispatch(requestLinodeForStore(id));

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
  lastEventAction?: Linode.EventAction,
  lastEventCreated?: string
) => {
  if (!lastEventAction || !lastEventCreated) {
    return false;
  }

  return (
    eventsWithRelevantNotifications.includes(lastEventAction) &&
    // if the event was created after the last time notifications were updated
    moment.utc(lastEventCreated).isAfter(moment.utc(notificationsLastUpdated))
  );
};

const eventsWithRelevantNotifications: Linode.EventAction[] = [
  'linode_resize',
  'linode_resize_create',
  'linode_migrate',
  'linode_mutate',
  'linode_mutate_create'
];
