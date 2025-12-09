import { useProfile } from '@linode/queries';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { formatDate } from 'src/utilities/formatDate';

import { channelTypeMap } from '../../constants';

import type { NotificationChannel } from '@linode/api-v4';

interface NotificationChannelTableRowProps {
  /**
   * The notification channel details used by the component to fill the row details
   */
  notificationChannel: NotificationChannel;
}

export const NotificationChannelTableRow = (
  props: NotificationChannelTableRowProps
) => {
  const { notificationChannel } = props;
  const { data: profile } = useProfile();
  const { id, label, channel_type, created_by, updated, updated_by, alerts } =
    notificationChannel;
  return (
    <TableRow
      data-qa-notification-channel-cell={id}
      key={`notification-channel-row-${id}`}
    >
      <TableCell>{label}</TableCell>
      <TableCell>{alerts.length}</TableCell>
      <TableCell>{channelTypeMap[channel_type]}</TableCell>
      <TableCell>{created_by}</TableCell>
      <TableCell>
        {formatDate(updated, {
          format: 'MMM dd, yyyy, h:mm a',
          timezone: profile?.timezone,
        })}
      </TableCell>
      <TableCell>{updated_by}</TableCell>
      <TableCell actionCell />
    </TableRow>
  );
};
