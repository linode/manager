import useCommunityNotifications from './useCommunityNotifications';
import usePendingActions from './PendingActionNotifications';
import SupportNotifications from './SupportNotifications';

/**
 * All data used for displaying notifications in the Dashboard
 * notification center and the notification drawer lives here.
 * Logic is contained in this folder rather than lower down because:
 * - The bell icon needs a list of all notifications of all types
 * - The drawer needs to be able to display a chronological list
 * of all notifications, in addition to sorting them by type.
 */
export const useNotificationData = () => {
  const community = useCommunityNotifications();
  const support = SupportNotifications();
  const pendingActions = usePendingActions();

  return {
    community,
    pendingActions,
    support
  };
};

export default useNotificationData;
