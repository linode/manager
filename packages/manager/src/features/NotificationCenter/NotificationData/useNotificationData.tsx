import { UseAPIRequest } from 'src/hooks/useAPIRequest';
import useCommunityNotifications, {
  CommunityNotifications
} from './useCommunityNotifications';
import usePendingActions from './PendingActionNotifications';
import useSystemStatusData from './useSystemStatusData';
import SupportNotifications from './SupportNotifications';
import { NotificationItem } from '../NotificationSection';

export interface NotificationData {
  community: CommunityNotifications;
  pendingActions: NotificationItem[];
  statusNotifications: NotificationItem[];
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
  const community = useCommunityNotifications();
  const support = SupportNotifications();
  const pendingActions = usePendingActions();
  const statusNotifications = useSystemStatusData();

  return {
    community,
    pendingActions,
    statusNotifications,
    support
  };
};

export default useNotificationData;
