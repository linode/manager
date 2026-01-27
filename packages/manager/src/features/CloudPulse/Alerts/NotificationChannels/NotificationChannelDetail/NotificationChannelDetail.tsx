import { Paper } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

export const NotificationChannelDetail = () => {
  const { channelId } = useParams({
    from: '/alerts/notification-channels/detail/$channelId',
  });
  // Placeholder content for Notification Channel Detail
  return <Paper>Notification Channel Details - id: {channelId}</Paper>;
};
