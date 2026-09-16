import { useAllAccountUsersQuery } from '@linode/queries';
import { CircleProgress, Stack, Typography } from '@linode/ui';
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

const MASKED_SECRET = '*****************';

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

    if (channelDetails.channel_type === 'webhook') {
      const webhook = channelDetails.details.webhook;
      const certificate = webhook.client_certificate_details;
      const isBasicAuthentication = webhook.authentication.type === 'basic';

      return (
        <>
          <Typography marginBottom={1} variant="h2">
            Details
          </Typography>
          <Stack spacing={1}>
            <DisplayAlertDetailChips
              label="Endpoint URL"
              values={[webhook.endpoint_url]}
            />
            <DisplayAlertDetailChips
              label="Compressed Data"
              values={[webhook.data_compression === 'gzip' ? 'Yes' : 'No']}
            />
            <DisplayAlertDetailChips
              label="Authentication"
              values={[isBasicAuthentication ? 'Basic' : 'None']}
            />
            {isBasicAuthentication && (
              <>
                <DisplayAlertDetailChips
                  label="Username"
                  values={[MASKED_SECRET]}
                />
                <DisplayAlertDetailChips
                  label="Password"
                  values={[MASKED_SECRET]}
                />
              </>
            )}
            {certificate && (
              <>
                <Typography paddingTop={1} variant="h2">
                  Client Certificate Authentication
                </Typography>
                {certificate.tls_hostname && (
                  <DisplayAlertDetailChips
                    copyable
                    label="TLS Hostname"
                    values={[certificate.tls_hostname]}
                  />
                )}
                <DisplayAlertDetailChips
                  copyable
                  label="CA Certificate"
                  truncate
                  values={[certificate.client_ca_certificate]}
                />
                <DisplayAlertDetailChips
                  copyable
                  label="Client Certificate"
                  truncate
                  values={[certificate.client_certificate]}
                />
                <DisplayAlertDetailChips
                  label="Client Private Key"
                  values={[MASKED_SECRET]}
                />
              </>
            )}
            {webhook.custom_headers.length > 0 && (
              <>
                <Typography paddingTop={1} variant="h2">
                  HTTPS Headers
                </Typography>
                {webhook.custom_headers.map((header, index) => (
                  <DisplayAlertDetailChips
                    key={`${header.name}-${index}`}
                    label={`Custom Header ${index + 1}`}
                    values={[header.name]}
                  />
                ))}
              </>
            )}
          </Stack>
        </>
      );
    }

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
