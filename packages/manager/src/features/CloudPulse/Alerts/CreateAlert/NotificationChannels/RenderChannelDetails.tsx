import { Chip } from '@mui/material';
import * as React from 'react';

import { shouldUseContentsForEmail } from '../../Utils/utils';

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
    const contentEmail = template.content?.email;
    const detailEmail = template.details?.email;
    const useContents = shouldUseContentsForEmail(template);

    const recipients = useContents
      ? (contentEmail?.email_addresses ?? [])
      : (detailEmail?.usernames ?? []);

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
