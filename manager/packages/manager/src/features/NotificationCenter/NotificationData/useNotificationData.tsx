import { Notification } from '@linode/api-v4/lib/account';
import { ExtendedEvent } from 'src/store/events/event.types';
import { NotificationItem } from '../NotificationSection';
import useEventNotifications from './useEventNotifications';
import useFormattedNotifications from './useFormattedNotifications';

export interface NotificationData {
  eventNotifications: NotificationItem[];
  formattedNotifications: NotificationItem[];
}

/**
 * All data used for displaying notifications in the Dashboard
 * notification center and the notification drawer lives here.
 * Logic is contained in this folder rather than lower down because:
 * - The bell icon needs a list of all notifications of all types
 * - The drawer needs to be able to display a chronological list
 * of all notifications, in addition to sorting them by type.
 */
const useNotificationData = (
  givenEvents?: ExtendedEvent[],
  givenNotifications?: Notification[]
): NotificationData => {
  const eventNotifications = useEventNotifications(givenEvents);
  const formattedNotifications = useFormattedNotifications(givenNotifications);

  return {
    formattedNotifications,
    eventNotifications,
  };
};

export default useNotificationData;
