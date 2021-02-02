import { UseAPIRequest } from 'src/hooks/useAPIRequest';
import { NotificationItem } from '../NotificationSection';
import SupportNotifications from './SupportNotifications';
import useEventNotifications from './useEventNotifications';

export interface NotificationData {
  eventNotifications: NotificationItem[];
  support: UseAPIRequest<NotificationItem[]>;
}

/**
 * All data used for displaying notifications in the Dashboard
 * notification center and the notification drawer lives here.
 * Logic is contained in this folder rather than lower down because:
 * - The bell icon needs a list of all notifications of all types
 * - The drawer needs to be able to display a chronological list
 * of all notifications, in addition to sorting them by type.
 */
export const useNotificationData = (): NotificationData => {
  const support = SupportNotifications();
  const eventNotifications = useEventNotifications();

  // Combine the data that should go into the Notifications section (support, Past Due, etc.) and store it in a single variable that gets returned below

  return {
    support,
    eventNotifications
  };
};

export default useNotificationData;
