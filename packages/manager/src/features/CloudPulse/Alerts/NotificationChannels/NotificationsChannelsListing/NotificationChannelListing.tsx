import { Box, Stack } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useAllAlertNotificationChannelsQuery } from 'src/queries/cloudpulse/alerts';

import { scrollToElement } from '../../Utils/AlertResourceUtils';
import { NotificationChannelListTable } from './NotificationChannelListTable';

export const NotificationChannelListing = () => {
  const {
    data: notificationChannels,
    error,
    isLoading,
  } = useAllAlertNotificationChannelsQuery();

  const [searchText, setSearchText] = React.useState<string>('');

  const topRef = React.useRef<HTMLDivElement>(null);

  const getNotificationChannelsList = React.useMemo(() => {
    if (!notificationChannels) {
      return [];
    }
    if (searchText) {
      return notificationChannels.filter(({ label }) =>
        label.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return notificationChannels;
  }, [notificationChannels, searchText]);

  return (
    <Stack spacing={3}>
      <Box
        alignItems="flex-start"
        display="flex"
        justifyContent="space-between"
        ref={topRef}
      >
        <DebouncedSearchTextField
          data-qa-filter="notification-channels-search"
          label=""
          noMarginTop
          onSearch={setSearchText}
          placeholder="Search for Notification Channels"
          sx={{ width: '270px' }}
          value={searchText}
        />
      </Box>
      <NotificationChannelListTable
        error={error ?? undefined}
        isLoading={isLoading}
        notificationChannels={getNotificationChannelsList}
        scrollToElement={() => scrollToElement(topRef.current)}
      />
    </Stack>
  );
};
