import { Paper } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

export const EditNotificationChannel = () => {
  const { channelId } = useParams({
    from: '/alerts/notification-channels/edit/$channelId',
  });
  // Placeholder content for Edit Notification Channel
  return <Paper>Edit Notification Channel - id: {channelId}</Paper>;
};
