import { capitalize } from '@akamai/compute-ui-core/formatting';
import { Chip, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { channelTypeOptions } from '../../constants';

import type { NotificationChannel } from '@linode/api-v4';

interface RenderChannelDetailProps {
  /**
   * Notification Channel with the data to be shown in the component
   */
  template: NotificationChannel;
  variant?: 'card' | 'drawer';
}

interface ChannelDetailRowProps {
  children: React.ReactNode;
  label: string;
}

const ChannelDetailRow = ({ children, label }: ChannelDetailRowProps) => (
  <Stack alignItems="baseline" direction="row">
    <Typography variant="h3" width={160}>
      {label}:
    </Typography>
    {children}
  </Stack>
);

export const RenderChannelDetails = (props: RenderChannelDetailProps) => {
  const { template, variant = 'card' } = props;

  if (variant === 'drawer' && template.channel_type === 'webhook') {
    return <Chip label={template.details.webhook.endpoint_url} />;
  }

  const channelType =
    channelTypeOptions.find((option) => option.value === template.channel_type)
      ?.label ?? capitalize(template.channel_type);

  let channelSpecificDetails: React.ReactNode = null;

  if (template.channel_type === 'webhook') {
    const { custom_headers: customHeaders, endpoint_url: endpointUrl } =
      template.details.webhook;

    channelSpecificDetails = (
      <>
        <ChannelDetailRow label="Endpoint URL">
          <Chip label={endpointUrl} />
        </ChannelDetailRow>
        {customHeaders.length > 0 && (
          <ChannelDetailRow label="Custom Headers">
            <Stack direction="row" gap={1}>
              {customHeaders.map(({ name }) => (
                <Chip key={name} label={name} />
              ))}
            </Stack>
          </ChannelDetailRow>
        )}
      </>
    );
  }

  if (template.channel_type === 'email') {
    const detailEmail = template.details.email;

    const hasUserNames =
      detailEmail.recipient_type === 'user' && detailEmail.usernames.length;

    const recipients = hasUserNames
      ? detailEmail.usernames
      : [detailEmail.recipient_type];
    const recipientChips = (
      <Stack direction="row">
        {recipients.map((value) => (
          <Chip key={value} label={value} />
        ))}
      </Stack>
    );

    channelSpecificDetails =
      variant === 'drawer' ? (
        recipientChips
      ) : (
        <ChannelDetailRow label="To">{recipientChips}</ChannelDetailRow>
      );
  }

  if (variant === 'drawer') return channelSpecificDetails;

  return (
    <Stack gap={2}>
      <ChannelDetailRow label="Type">
        <Typography data-qa-channel-type variant="subtitle2">
          {channelType}
        </Typography>
      </ChannelDetailRow>
      {channelSpecificDetails}
    </Stack>
  );
};
