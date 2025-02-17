import { Box, Button, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useAllAlertNotificationChannelsQuery } from 'src/queries/cloudpulse/alerts';
import { capitalize } from 'src/utilities/capitalize';

import { channelTypeOptions } from '../../constants';
import { getAlertBoxStyles } from '../../Utils/utils';
import { ClearIconButton } from '../Criteria/ClearIconButton';
import { AddNotificationChannelDrawer } from './AddNotificationChannelDrawer';
import { RenderChannelDetails } from './RenderChannelDetails';

import type { CreateAlertDefinitionForm } from '../types';
import type { NotificationChannel } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface AddChannelListingProps {
  /**
   *  FieldPathByValue for the notification channel ids
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, number[]>;
}

interface NotificationChannelsProps {
  /**
   * index of the NotificationChannels map
   */
  id: number;
  /**
   * NotificationChannel object
   */
  notification: NotificationChannel;
}
export const AddChannelListing = (props: AddChannelListingProps) => {
  const { name } = props;
  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();
  const [openAddNotification, setOpenAddNotification] = React.useState(false);

  const theme = useTheme();
  const notificationChannelWatcher = useWatch({
    control,
    name,
  });
  const {
    data: notificationData,
    isError: notificationChannelsError,
    isLoading: notificationChannelsLoading,
  } = useAllAlertNotificationChannelsQuery();

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
    setValue(name, newList, { shouldValidate: true });
  };

  const handleOpenDrawer = () => {
    setOpenAddNotification(true);
  };

  const handleCloseDrawer = () => {
    setOpenAddNotification(false);
  };

  const handleAddNotification = (notificationId: number) => {
    setValue(name, [...notificationChannelWatcher, notificationId], {
      shouldValidate: true,
    });
    handleCloseDrawer();
  };

  const NotificationChannelCard = (props: NotificationChannelsProps) => {
    const { id, notification } = props;
    return (
      <Box
        sx={(theme) => ({
          ...getAlertBoxStyles(theme),
          borderRadius: 1,
          overflow: 'auto',
          padding: theme.spacing(2),
        })}
        data-testid={`notification-channel-${id}`}
        key={id}
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography marginBottom={2} variant="h3">
            {capitalize(notification?.label ?? 'Unnamed Channel')}
          </Typography>
          <ClearIconButton handleClick={() => handleRemove(id)} />
        </Stack>
        <Stack alignItems="baseline" direction="row">
          <Typography variant="h3" width={100}>
            Type:
          </Typography>
          <Typography variant="subtitle2">
            {
              channelTypeOptions.find(
                (option) => option.value === notification?.channel_type
              )?.label
            }
          </Typography>
        </Stack>
        <Stack alignItems="baseline" direction="row">
          <Typography variant="h3" width={100}>
            To:
          </Typography>
          <Typography variant="subtitle2">
            {notification && <RenderChannelDetails template={notification} />}
          </Typography>
        </Stack>
      </Box>
    );
  };

  return (
    <Controller
      render={({ fieldState, formState }) => (
        <>
          <Typography marginBottom={1} marginTop={3} variant="h2">
            4. Notification Channels
          </Typography>
          {(formState.isSubmitted || fieldState.isTouched) && fieldState.error && (
            <Typography
              color={theme.tokens.content.Text.Negative}
              variant="body2"
            >
              {fieldState.error.message}
            </Typography>
          )}
          <Stack spacing={1}>
            {selectedNotifications.length > 0 &&
              selectedNotifications.map((notification, id) => (
                <NotificationChannelCard
                  id={id}
                  key={id}
                  notification={notification}
                />
              ))}
          </Stack>
          <Button
            buttonType="outlined"
            data-qa-buttons="true"
            onClick={handleOpenDrawer}
            size="medium"
            sx={(theme) => ({ marginTop: theme.spacing(2) })}
            type="button"
          >
            Add notification channel
          </Button>

          <AddNotificationChannelDrawer
            handleCloseDrawer={handleCloseDrawer}
            isNotificationChannelsError={notificationChannelsError}
            isNotificationChannelsLoading={notificationChannelsLoading}
            onSubmitAddNotification={handleAddNotification}
            open={openAddNotification}
            templateData={notifications ?? []}
          />
        </>
      )}
      control={control}
      name={name}
    />
  );
};
