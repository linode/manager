import type { NotificationChannelActionHandlers } from '../NotificationsChannelsListing/NotificationChannelActionMenu';
import type { AlertNotificationType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export const getNotificationChannelActionsList = ({
  handleDetails,
}: NotificationChannelActionHandlers): Record<
  AlertNotificationType,
  Action[]
> => ({
  system: [
    {
      onClick: handleDetails,
      title: 'Show Details',
    },
  ],
  user: [
    {
      onClick: handleDetails,
      title: 'Show Details',
    },
  ],
});
