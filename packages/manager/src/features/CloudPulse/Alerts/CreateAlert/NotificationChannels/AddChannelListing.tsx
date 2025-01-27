import { Box, Button, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Drawer } from 'src/components/Drawer';
import { capitalize } from 'src/utilities/capitalize';

import { channelTypeOptions } from '../../constants';
import { getAlertBoxStyles } from '../../Utils/utils';
import { ClearIconButton } from '../Criteria/ClearIconButton';
import { AddNotificationChannel } from './AddNotificationChannel';
import { RenderChannelDetails } from './RenderChannelDetails';

import type { CreateAlertDefinitionForm } from '../types';
import type { NotificationChannel } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface AddChannelListingProps {
  /**
   * Boolean for the Notification channels api error response
   */
  isNotificationChannelsError: boolean;
  /**
   * Boolean for the Notification channels api loading response
   */
  isNotificationChannelsLoading: boolean;
  /**
   *
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, number[]>;
  /**
   * Notification channel data fetched from the api
   */
  notificationData: NotificationChannel[];
}

export const AddChannelListing = React.memo(
  ({
    isNotificationChannelsError,
    isNotificationChannelsLoading,
    name,
    notificationData,
  }: AddChannelListingProps) => {
    const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();
    const [openAddNotification, setOpenAddNotification] = React.useState(false);

    const notificationChannelWatcher = useWatch({
      control,
      name,
    });

    const notifications = React.useMemo(() => {
      return (
        notificationData?.filter(
          ({ id }) => !notificationChannelWatcher.includes(id)
        ) ?? []
      );
    }, [notificationChannelWatcher, notificationData]);

    const selectedNotifications = React.useMemo(() => {
      return (
        notificationChannelWatcher
          .map((notificationId) =>
            notificationData?.find(({ id }) => id === notificationId)
          )
          .filter((notification) => notification !== undefined) ?? []
      );
    }, [notificationChannelWatcher, notificationData]);

    const handleRemove = (index: number) => {
      const newList = notificationChannelWatcher.filter((_, i) => i !== index);
      setValue(name, newList);
    };

    const handleOpenDrawer = () => {
      setOpenAddNotification(true);
    };

    const handleCloseDrawer = () => {
      setOpenAddNotification(false);
    };

    const handleAddNotification = (notificationId: number) => {
      setValue(name, [...notificationChannelWatcher, notificationId]);
      handleCloseDrawer();
    };

    return (
      <>
        <Typography marginBottom={1} marginTop={3} variant="h2">
          3. Notification Channels
        </Typography>
        <Stack spacing={1}>
          {selectedNotifications.length > 0 &&
            selectedNotifications.map((notification, id) => (
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
                  <Typography variant="h3">
                    {capitalize(notification?.label ?? 'Unnamed Channel')}
                  </Typography>
                  <ClearIconButton handleClick={() => handleRemove(id)} />
                </Box>
                <Grid container paddingLeft={2}>
                  <Grid alignItems="center" container item md={1} sm={1} xs={2}>
                    <Typography variant="h3">Type:</Typography>
                  </Grid>
                  <Grid container item md="auto" sm="auto" xs={2}>
                    <Typography variant="subtitle2">
                      {
                        channelTypeOptions.find(
                          (option) =>
                            option.value === notification?.channel_type
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
            ))}
        </Stack>
        <Button
          buttonType="outlined"
          onClick={handleOpenDrawer}
          size="medium"
          sx={(theme) => ({ marginTop: theme.spacing(2) })}
          type="button"
        >
          Add notification channel
        </Button>

        <Drawer
          onClose={handleCloseDrawer}
          open={openAddNotification}
          title="Add Notification Channel"
        >
          <AddNotificationChannel
            isNotificationChannelsError={isNotificationChannelsError}
            isNotificationChannelsLoading={isNotificationChannelsLoading}
            onCancel={handleCloseDrawer}
            onSubmitAddNotification={handleAddNotification}
            templateData={notifications ?? []}
          />
        </Drawer>
      </>
    );
  }
);
