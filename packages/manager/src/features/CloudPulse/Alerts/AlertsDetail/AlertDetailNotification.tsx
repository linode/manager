import { CircleProgress, Stack, Typography } from '@linode/ui';
import { Divider, Grid } from '@mui/material';
import React from 'react';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useAlertNotificationChannelsQuery } from 'src/queries/cloudpulse/alerts';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { getChipLabels } from '../Utils/utils';
import { AlertDetailRow } from './AlertDetailRow';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';

interface NotificationProps {
  /*
   * The list of channel ids associated with the alert for which we need to display the notification channels
   */
  channelIds: string[];
}
export const AlertDetailNotification = (props: NotificationProps) => {
  const { channelIds } = props;

  const {
    data: channels,
    isError,
    isFetching,
  } = useAlertNotificationChannelsQuery({}, { id: channelIds.join(',') });

  if (isFetching) {
    return <CircleProgress />;
  }

  return (
    <Stack gap={2}>
      <Typography variant="h2">Notification Channels</Typography>
      {isError && (
        <ErrorState errorText="Failed to load notification channels." />
      )}
      {!isError && (
        <Grid alignItems="center" container spacing={2}>
          {channels &&
            channels.map((value, index) => {
              const { channel_type, id, label } = value;
              return (
                <Grid container item key={id} spacing={2}>
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
                  <Grid item xs={12}>
                    <DisplayAlertDetailChips
                      {...getChipLabels(value)}
                      labelGridColumns={2}
                      valueGridColumns={10}
                    />
                  </Grid>
                  {channels.length > 1 && index !== channels.length - 1 && (
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  )}
                </Grid>
              );
            })}
        </Grid>
      )}
    </Stack>
  );
};
