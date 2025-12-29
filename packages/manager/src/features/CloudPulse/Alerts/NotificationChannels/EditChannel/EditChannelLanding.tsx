import { Box, CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import NullComponent from 'src/components/NullComponent';
import { useNotificationChannelQuery } from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../../AlertsDetail/AlertDetail';
import { EditNotificationChannel } from './EditNotificationChannel';

import type { NotificationChannel } from '@linode/api-v4';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

const overrides: CrumbOverridesProps[] = [
  {
    label: 'Notification Channels',
    linkTo: '/alerts/notification-channels',
    position: 1,
  },
];

const getLoadingOrErrorState = (
  channelData: NotificationChannel | undefined,
  isLoading: boolean,
  isError: boolean
): React.JSX.Element => {
  if (!channelData) {
    return <StyledPlaceholder icon={EntityIcon} title="No Data to display." />;
  }
  if (isLoading) {
    return <CircleProgress />;
  }
  if (isError) {
    return (
      <ErrorState errorText="An error occurred while loading the notification channel. Please try again later." />
    );
  }
  return <NullComponent />;
};

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

  if (!channelData || isLoading || isError) {
    return (
      <EditChannelState overrides={overrides} pathname={pathname}>
        {getLoadingOrErrorState(channelData, isLoading, isError)}
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
