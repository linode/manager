import { Chip } from '@mui/material';
import * as React from 'react';

import type { NotificationChannel } from '@linode/api-v4';

interface RenderChannelDetailProps {
  /**
   * Notification Channel with the data to be shown in the component
   */
  template: NotificationChannel;
}
export const RenderChannelDetails = (props: RenderChannelDetailProps) => {
  const { template } = props;
  if (template.channel_type === 'email') {
    const detailEmail = template.details.email;

    const hasUserNames =
      detailEmail.recipient_type === 'user' && detailEmail.usernames.length;

    const recipients = hasUserNames
      ? detailEmail.usernames
      : [detailEmail.recipient_type];
    return (
      <>
        {recipients.map((value) => (
          <Chip key={value} label={value} />
        ))}
      </>
    );
  }
  return null;
};
