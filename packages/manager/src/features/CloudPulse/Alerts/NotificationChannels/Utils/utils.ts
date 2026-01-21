import { DELETE_CHANNEL_TOOLTIP_TEXT } from '../../constants';

import type { NotificationChannelActionHandlers } from '../NotificationsChannelsListing/NotificationChannelActionMenu';
import type { AlertNotificationType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface NotificationChannelActionsListProps {
  /**
   * Number of alerts associated with the notification channel
   */
  alertsCount: number;
  /**
   * Handlers for actions like edit, delete, show details, etc.,
   */
  handlers: NotificationChannelActionHandlers;
}
export const getNotificationChannelActionsList = (
  props: NotificationChannelActionsListProps
): Record<AlertNotificationType, Action[]> => {
  const { handlers, alertsCount } = props;
  const { handleDetails, handleDelete, handleEdit } = handlers;
  return {
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
      {
        onClick: handleEdit,
        title: 'Edit',
      },
      {
        onClick: handleDelete,
        title: 'Delete',
        disabled: alertsCount > 0,
        tooltip: alertsCount > 0 ? DELETE_CHANNEL_TOOLTIP_TEXT : undefined,
      },
    ],
  };
};
