import { Box, Button, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { capitalize } from 'src/utilities/capitalize';

import { channelTypeOptions } from '../../constants';
import { getAlertBoxStyles } from '../../Utils/utils';
import { ClearIconButton } from '../Criteria/ClearIconButton';
import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannel } from '@linode/api-v4';

interface ChannelListProps {
  /**
   * Notification channel list passed to the component to be displayed in the form
   */
  notifications: NotificationChannel[];
  /**
   * Method to handle the deletions of the Notification Channels in the form
   * @param notifications sends the latest list of notification channels
   * @returns void
   */
  onChangeNotifications: (notifications: NotificationChannel[]) => void;
  /**
   * Method to enable the add notification channel drawer
   * @returns void
   */
  onClickAddNotification: () => void;
}

export const AddChannelListing = React.memo((props: ChannelListProps) => {
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
                  ...getAlertBoxStyles(theme),
                  borderRadius: 1,
                  overflow: 'auto',
                  padding: 0,
                  paddingBottom: theme.spacing(2),
                })}
                data-testid={`notification-channel-${id}`}
                key={id}
              >
                <Box
                  sx={(theme) => ({
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: theme.spacing(1),
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                    paddingTop: theme.spacing(2),
                  })}
                >
                  <Typography alignItems="flex-end" variant="h3">
                    {capitalize(notification.label)}
                  </Typography>
                  <ClearIconButton handleClick={() => handleRemove(id)} />
                </Box>
                <Grid container paddingLeft={2}>
                  <Grid alignItems="center" container item md={1} sm={1} xs={2}>
                    <Typography variant="h3">Type:</Typography>
                  </Grid>
                  <Grid container item md="auto" sm="auto" xs={2}>
                    <Typography alignItems="center" variant="subtitle2">
                      {
                        channelTypeOptions.find(
                          (option) => option.value === notification.channel_type
                        )?.label
                      }
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container paddingLeft={2}>
                  <Grid alignContent="center" item md={1} sm={1} xs={2}>
                    <Typography variant="h3">To:</Typography>
                  </Grid>
                  <Grid item md="auto" paddingRight={1} sm="auto" xs="auto">
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
});
