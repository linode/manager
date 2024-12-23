import { Box, Button, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { ClearIconButton } from '../Criteria/ClearIconButton';
import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannel } from '@linode/api-v4';

interface ChannelListProps {
  /**
   * notification channel list passed to the component to be displayed in the form
   */
  notifications: NotificationChannel[];
  /**
   * method to handle the deletions of the Notification Channels in the form
   * @param notifications sends the latest list of notification channels
   * @returns void
   */
  onChangeNotifications: (notifications: NotificationChannel[]) => void;
  /**
   * to enable the add notification channel drawer
   * @returns void
   */
  onClickAddNotification: () => void;
}

export const AddChannelListing = (props: ChannelListProps) => {
  const {
    notifications,
    onChangeNotifications,
    onClickAddNotification,
  } = props;
  const handleRemove = (index: number) => {
    const newList = notifications.filter((_, i) => i !== index);
    onChangeNotifications(newList);
  };
  return (
    <>
      <Typography marginBottom={1} marginTop={3} variant="h2">
        3. Notification Channels
      </Typography>
      <Stack spacing={1}>
        {notifications.length > 0 &&
          notifications.map((notification, id) => {
            return (
              <Box
                sx={(theme) => ({
                  backgroundColor:
                    theme.name === 'light'
                      ? theme.color.grey5
                      : theme.color.grey9,
                  borderRadius: 1,
                  p: 1,
                })}
                data-testid={`Notification-channel-${id}`}
                key={id}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 2,
                    width: '100%',
                  }}
                >
                  <Typography variant="h3"> {notification.label}</Typography>
                  <ClearIconButton handleClick={() => handleRemove(id)} />
                </Box>
                <Grid container paddingLeft={2}>
                  <Grid item md={1} paddingBottom={1}>
                    <Typography variant="h3">Type:</Typography>
                  </Grid>
                  <Grid item md={11}>
                    <Typography variant="subtitle2">
                      {notification.channel_type}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container paddingLeft={2}>
                  <Grid alignContent="center" item md={1}>
                    <Typography variant="h3">To:</Typography>
                  </Grid>
                  <Grid item md={11}>
                    {notification && (
                      <RenderChannelDetails template={notification} />
                    )}
                  </Grid>
                </Grid>
              </Box>
            );
          })}
      </Stack>
      <Box mt={1}>
        <Button
          buttonType="outlined"
          onClick={onClickAddNotification}
          size="medium"
        >
          Add notification channel
        </Button>
      </Box>
    </>
  );
};
