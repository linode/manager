import { Box, CircleProgress, ErrorState, Stack } from '@linode/ui';
import { useTheme } from '@mui/material';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import AlertsIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useNotificationChannelQuery } from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../../AlertsDetail/AlertDetail';
import { getAlertBoxStyles } from '../../Utils/utils';
import { NotificationChannelAlerts } from './NotificationChannelAlerts';
import { NotificationChannelDetailOverview } from './NotificationChannelDetailOverview';
import { NotificationChannelRecipients } from './NotificationChannelDetailRecipients';

import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

export const NotificationChannelDetail = () => {
  const { channelId } = useParams({
    from: '/alerts/notification-channels/detail/$channelId',
  });

  const {
    data: channelDetails,
    isError,
    isLoading,
  } = useNotificationChannelQuery(Number(channelId));

  const theme = useTheme();
  const nonSuccessBoxHeight = '600px';
  const sectionMaxHeight = '290px';

  const overrides: CrumbOverridesProps[] = [
    {
      label: 'Notification Channels',
      linkTo: '/alerts/notification-channels',
      position: 1,
    },
  ];

  if (isLoading) {
    return (
      <>
        <Breadcrumb
          crumbOverrides={overrides}
          pathname="/Notification Channels/Details"
        />
        <Box alignContent="center" height={nonSuccessBoxHeight}>
          <CircleProgress />
        </Box>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Breadcrumb
          crumbOverrides={overrides}
          pathname="/Notification Channels/Details"
        />
        <Box alignContent="center" height={nonSuccessBoxHeight}>
          <ErrorState errorText="An error occurred while loading the notification channel. Please try again later." />
        </Box>
      </>
    );
  }

  if (!channelDetails) {
    return (
      <>
        <Breadcrumb
          crumbOverrides={overrides}
          pathname="/Notification Channels/Details"
        />
        <Box alignContent="center" height={nonSuccessBoxHeight}>
          <StyledPlaceholder
            icon={AlertsIcon}
            isEntity
            title="No Data to display."
          />
        </Box>
      </>
    );
  }
  return (
    <>
      <DocumentTitleSegment segment={`${channelDetails?.label}`} />
      <Stack spacing={1}>
        <Breadcrumb
          crumbOverrides={overrides}
          pathname="/Notification Channels/Details"
        />
        <Box display="flex" flexDirection="column" gap={2} mt={0}>
          <Box
            display="flex"
            flexDirection={{ md: 'row', xs: 'column' }}
            gap={2}
          >
            <Box
              data-qa-section="Overview"
              flexBasis="50%"
              maxHeight={sectionMaxHeight}
              sx={{ ...getAlertBoxStyles(theme), overflow: 'auto' }}
            >
              <NotificationChannelDetailOverview
                channelDetails={channelDetails}
              />
            </Box>
            <Box
              data-qa-section="Details"
              flexBasis="50%"
              maxHeight={sectionMaxHeight}
              sx={{
                ...getAlertBoxStyles(theme),
                overflow: 'auto',
              }}
            >
              <NotificationChannelRecipients channelDetails={channelDetails} />
            </Box>
          </Box>
          <Box
            data-qa-section="Associated Alerts"
            sx={{
              ...getAlertBoxStyles(theme),
              overflow: 'auto',
            }}
          >
            <NotificationChannelAlerts channelId={Number(channelId)} />
          </Box>
        </Box>
      </Stack>
    </>
  );
};
