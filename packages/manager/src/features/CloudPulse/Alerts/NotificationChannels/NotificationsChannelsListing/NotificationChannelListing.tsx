import { Box, Button, Stack } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
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

  const navigate = useNavigate();

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
        alignItems={{ lg: 'flex-end', md: 'flex-start' }}
        display="flex"
        flexDirection={{ lg: 'row', md: 'column', sm: 'column', xs: 'column' }}
        flexWrap="wrap"
        gap={3}
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
        <Button
          buttonType="primary"
          data-qa-button="create-channel"
          data-qa-buttons="true"
          disabled={isLoading}
          onClick={() => {
            navigate({ to: '/alerts/notification-channels/create' });
          }}
          sx={{
            height: '34px',
            paddingBottom: 0,
            paddingTop: 0,
            whiteSpace: 'noWrap',
            width: { lg: '120px', md: '120px', sm: '150px', xs: '150px' },
          }}
          variant="contained"
        >
          Create Channel
        </Button>
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
