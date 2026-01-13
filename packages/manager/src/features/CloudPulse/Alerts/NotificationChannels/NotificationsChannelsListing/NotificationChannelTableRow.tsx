import { useProfile } from '@linode/queries';
import React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { formatDate } from 'src/utilities/formatDate';

import { channelTypeMap } from '../../constants';
import { NotificationChannelActionMenu } from './NotificationChannelActionMenu';

import type { NotificationChannelActionHandlers } from './NotificationChannelActionMenu';
import type { NotificationChannel } from '@linode/api-v4';

interface NotificationChannelTableRowProps {
  /**
   * The callback handlers for clicking an action menu item
   */
  handlers: NotificationChannelActionHandlers;
  /**
   * The notification channel details used by the component to fill the row details
   */
  notificationChannel: NotificationChannel;
}

export const NotificationChannelTableRow = (
  props: NotificationChannelTableRowProps
) => {
  const { handlers, notificationChannel } = props;
  const { data: profile } = useProfile();
  const {
    id,
    label,
    channel_type,
    created_by,
    updated,
    updated_by,
    alerts,
    type,
  } = notificationChannel;
  return (
    <TableRow
      data-qa-notification-channel-cell={id}
      key={`notification-channel-row-${id}`}
    >
      <TableCell>
        <Link
          data-qa-alert-link
          params={{ channelId: String(id) }}
          to={'/alerts/notification-channels/detail/$channelId'}
        >
          {label}
        </Link>
      </TableCell>
      <TableCell>{alerts.alert_count}</TableCell>
      <TableCell>{channelTypeMap[channel_type]}</TableCell>
      <TableCell>{created_by}</TableCell>
      <TableCell>
        {formatDate(updated, {
          format: 'MMM dd, yyyy, h:mm a',
          timezone: profile?.timezone,
        })}
      </TableCell>
      <TableCell>{updated_by}</TableCell>
      <TableCell
        actionCell
        data-qa-notification-channel-action-cell={`notification-channel-${id}`}
      >
        <NotificationChannelActionMenu
          alertsCount={alerts.length}
          channelLabel={label}
          handlers={handlers}
          notificationType={type}
        />
      </TableCell>
    </TableRow>
  );
};
