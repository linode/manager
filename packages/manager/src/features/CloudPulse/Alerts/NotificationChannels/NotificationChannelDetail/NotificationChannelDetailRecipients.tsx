import { useAllAccountUsersQuery } from '@linode/queries';
import { CircleProgress, Typography } from '@linode/ui';
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
    const isEmailChannel = channelDetails.channel_type === 'email';

    const {
      data: accountUsers,
      isLoading: isLoadingAccountUsers,
      isError: isAccountUsersError,
    } = useAllAccountUsersQuery(isEmailChannel, {
      '+order': 'asc',
      '+order_by': 'username',
    });

    // Only email channels have recipient details
    if (!isEmailChannel) {
      return null;
    }

    const emailDetails = channelDetails.details?.email;

    // Get usernames from details or email_addresses from content

    const recipients = emailDetails?.usernames ?? [];
    const mappedRecipients = accountUsers
      ?.filter((user) => recipients.includes(user.username))
      .map((user) => `${user.username} (${user.email})`);

    const recipientsToDisplay =
      !isAccountUsersError && mappedRecipients && mappedRecipients.length > 0
        ? mappedRecipients
        : recipients;
    const recipientType = emailDetails?.recipient_type;
    return (
      <>
        <Typography marginBottom={2} variant="h2">
          Details
        </Typography>
        <GridLegacy
          container
          maxHeight="180px"
          spacing={1}
          sx={{
            alignItems: 'center',
          }}
        >
          <DisplayAlertDetailChips
            label="Recipient Type"
            valueGridColumns={2}
            values={[recipientType ?? '']}
          />
          {isLoadingAccountUsers && <CircleProgress />}
          {recipientsToDisplay.length ? (
            <DisplayAlertDetailChips
              label="Recipients"
              mergeChips={false}
              values={recipientsToDisplay}
            />
          ) : null}
        </GridLegacy>
      </>
    );
  }
);
