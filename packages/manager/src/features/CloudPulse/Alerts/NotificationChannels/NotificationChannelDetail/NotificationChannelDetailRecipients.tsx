import { Typography } from '@linode/ui';
import GridLegacy from '@mui/material/GridLegacy';
import React from 'react';

import { DisplayAlertDetailChips } from '../../AlertsDetail/DisplayAlertDetailChips';

import type { NotificationChannel } from '@linode/api-v4';

interface NotificationChannelRecipientsProps {
  /**
   * The notification channel object containing the recipient details.
   */
  channelDetails: NotificationChannel;
}

export const NotificationChannelRecipients = React.memo(
  (props: NotificationChannelRecipientsProps) => {
    const { channelDetails } = props;

    // Only email channels have recipient details
    if (channelDetails.channel_type !== 'email') {
      return null;
    }

    const emailDetails = channelDetails.details?.email;

    // Get usernames from details or email_addresses from content
    const recipients = emailDetails?.usernames ?? [];
    return (
      <>
        <Typography marginBottom={2} variant="h2">
          Settings
        </Typography>
        <GridLegacy
          container
          maxHeight="180px"
          overflow="auto"
          spacing={1}
          sx={{
            scrollbarWidth: 'thin',
            alignItems: 'center',
          }}
        >
          <DisplayAlertDetailChips
            label="Recipients"
            mergeChips={false}
            valueGridColumns={2}
            values={recipients}
          />
        </GridLegacy>
      </>
    );
  }
);
