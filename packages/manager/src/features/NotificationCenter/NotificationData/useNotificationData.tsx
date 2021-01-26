import usePendingActions from './PendingActionNotifications';
import { NotificationItem } from '../NotificationSection';

export interface NotificationData {
  pendingActions: NotificationItem[];
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
  const pendingActions = usePendingActions();

  return {
    pendingActions
  };
};

export default useNotificationData;
