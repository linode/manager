import { useProfile } from '@linode/queries';
import { Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Grid } from '@mui/material';
import React from 'react';

import { formatDate } from 'src/utilities/formatDate';

import { AlertDetailRow } from '../../AlertsDetail/AlertDetailRow';

import type { NotificationChannel } from '@linode/api-v4';

interface NotificationChannelDetailOverviewProps {
  /*
   * The notification channel object containing all the details for which the overview needs to be displayed.
   */
  channelDetails: NotificationChannel;
}

export const NotificationChannelDetailOverview = React.memo(
  (props: NotificationChannelDetailOverviewProps) => {
    const { channelDetails } = props;
    const { data: profile } = useProfile();
    const {
      created,
      created_by: createdBy,
      label,
      updated,
      updated_by: updatedBy,
      channel_type: channelType,
    } = channelDetails;

    return (
      <>
        <Typography marginBottom={3} variant="h2">
          Overview
        </Typography>
        <Grid
          container
          spacing={1}
          sx={{
            alignItems: 'center',
          }}
        >
          <AlertDetailRow label="Name" value={label} />
          <AlertDetailRow
            label="Channel Type"
            value={capitalize(channelType)}
          />
          <AlertDetailRow label="Created by" value={createdBy} />
          <AlertDetailRow
            label="Creation Time"
            value={formatDate(created, {
              format: 'MMM dd, yyyy, h:mm a',
              timezone: profile?.timezone,
            })}
          />
          <AlertDetailRow
            label="Last Modified"
            value={formatDate(updated, {
              format: 'MMM dd, yyyy, h:mm a',
              timezone: profile?.timezone,
            })}
          />
          <AlertDetailRow label="Last Modified by" value={updatedBy} />
        </Grid>
      </>
    );
  }
);