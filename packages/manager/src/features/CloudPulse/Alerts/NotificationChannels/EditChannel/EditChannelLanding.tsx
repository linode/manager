import { Box, CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { useNotificationChannelQuery } from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../../AlertsDetail/AlertDetail';
import { EditNotificationChannel } from './EditNotificationChannel';

import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

const overrides: CrumbOverridesProps[] = [
  {
    label: 'Notification Channels',
    linkTo: '/alerts/notification-channels',
    position: 1,
  },
];

export const EditChannelLanding = () => {
  const { channelId } = useParams({
    from: '/alerts/notification-channels/edit/$channelId',
  });
  const {
    data: channelData,
    isError,
    isLoading,
  } = useNotificationChannelQuery(Number(channelId));
  const pathname = '/Notification Channels/Edit';

  if (isLoading) {
    return (
      <EditChannelState overrides={overrides} pathname={pathname}>
        <CircleProgress />
      </EditChannelState>
    );
  }

  if (isError) {
    return (
      <EditChannelState overrides={overrides} pathname={pathname}>
        <ErrorState errorText="An error occurred while loading the notification channel. Please try again later." />
      </EditChannelState>
    );
  }

  if (!channelData) {
    return (
      <EditChannelState overrides={overrides} pathname={pathname}>
        <StyledPlaceholder icon={EntityIcon} title="No Data to display." />
      </EditChannelState>
    );
  }

  return (
    <EditNotificationChannel channelData={channelData} channelId={channelId} />
  );
};

/**
 * A component that renders a common UI structure for loading, error, or empty states.
 * @param pathname - The current pathname to be provided in breadcrumb
 * @param crumbOverrides - The overrides to be provided in breadcrumb
 * @param children - The message component (e.g., CircleProgress, ErrorState, or Placeholder)
 */
const EditChannelState = ({
  children,
  overrides,
  pathname,
}: {
  children: React.ReactNode;
  overrides: CrumbOverridesProps[];
  pathname: string;
}) => {
  return (
    <>
      <Breadcrumb crumbOverrides={overrides} pathname={pathname} />
      <Box alignContent="center" height="600px">
        {children}
      </Box>
    </>
  );
};
