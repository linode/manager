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
    return template.content.email.email_addresses.map((value, index) => (
      <Chip key={index} label={value} />
    ));
  }
  return null;
};
