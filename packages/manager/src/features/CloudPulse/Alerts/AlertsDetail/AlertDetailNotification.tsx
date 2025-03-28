import { CircleProgress, ErrorState, Stack, Typography } from '@linode/ui';
import { Divider, Grid } from '@mui/material';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { useAllAlertNotificationChannelsQuery } from 'src/queries/cloudpulse/alerts';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { getChipLabels } from '../Utils/utils';
import { StyledPlaceholder } from './AlertDetail';
import { AlertDetailRow } from './AlertDetailRow';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';

import type { Filter } from '@linode/api-v4';

interface NotificationChannelProps {
  /**
   * List of channel IDs associated with the alert.
   * These IDs are used to fetch and display notification channels.
   */
  channelIds: number[];
}
export const AlertDetailNotification = React.memo(
  (props: NotificationChannelProps) => {
    const { channelIds } = props;

    // Construct filter for API request based on channel IDs
    const channelIdOrFilter: Filter = {
      '+or': channelIds.map((id) => ({ id })),
    };

    const {
      data: channels,
      isError,
      isFetching,
    } = useAllAlertNotificationChannelsQuery({}, channelIdOrFilter);

    // Handle loading, error, and empty state scenarios
    if (isFetching) {
      return getAlertNotificationMessage(<CircleProgress />);
    }
    if (isError) {
      return getAlertNotificationMessage(
        <ErrorState errorText="Failed to load notification channels." />
      );
    }
    if (!channels?.length) {
      return getAlertNotificationMessage(
        <StyledPlaceholder
          icon={EntityIcon}
          title="No notification channels to display."
        />
      );
    }

    return (
      <Stack gap={2}>
        <Typography marginBottom={2} variant="h2">
          Notification Channels
        </Typography>
        <Grid
          sx={{
            alignItems: 'center',
          }}
          container
          spacing={2}
        >
          {channels.map((notificationChannel, index) => {
            const { channel_type, id, label } = notificationChannel;
            return (
              <Grid container key={id} spacing={2}>
                <AlertDetailRow
                  label="Type"
                  labelGridColumns={2}
                  value={convertStringToCamelCasesWithSpaces(channel_type)}
                  valueGridColumns={10}
                />
                <AlertDetailRow
                  label="Channel"
                  labelGridColumns={2}
                  value={label}
                  valueGridColumns={10}
                />
                <Grid>
                  <DisplayAlertDetailChips
                    {...getChipLabels(notificationChannel)}
                    labelGridColumns={2}
                    valueGridColumns={10}
                  />
                </Grid>
                {channels.length > 1 && index !== channels.length - 1 && (
                  <Grid>
                    <Divider />
                  </Grid>
                )}
              </Grid>
            );
          })}
        </Grid>
      </Stack>
    );
  }
);

/**
 * Returns a common UI structure for loading, error, or empty states.
 * @param content - A React component to display (e.g., CircleProgress, ErrorState, or Placeholder).
 */
const getAlertNotificationMessage = (messageComponent: React.ReactNode) => {
  return (
    <Stack gap={2}>
      <Typography variant="h2">Notification Channels</Typography>
      {messageComponent}
    </Stack>
  );
};
