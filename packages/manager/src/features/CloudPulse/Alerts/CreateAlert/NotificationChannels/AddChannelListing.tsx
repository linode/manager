import { Box, Button, Stack, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { useAllAlertNotificationChannelsQuery } from 'src/queries/cloudpulse/alerts';

import { channelTypeOptions, MULTILINE_ERROR_SEPARATOR } from '../../constants';
import { AlertListNoticeMessages } from '../../Utils/AlertListNoticeMessages';
import { getAlertBoxStyles } from '../../Utils/utils';
import { ClearIconButton } from '../Criteria/ClearIconButton';
import { AddNotificationChannelDrawer } from './AddNotificationChannelDrawer';
import { RenderChannelDetails } from './RenderChannelDetails';

import type { CreateAlertDefinitionForm } from '../types';
import type { NotificationChannel } from '@linode/api-v4';

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

  const NotificationChannelCard = React.memo(
    (props: NotificationChannelsProps) => {
      const { id, notification } = props;
      return (
        <Box
          data-qa-notification={`notification-channel-${id}`}
          data-testid={`notification-channel-${id}`}
          key={id}
          sx={(theme) => ({
            ...getAlertBoxStyles(theme),
            borderRadius: 1,
            overflow: 'auto',
            padding: theme.spacing(2),
          })}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography data-qa-channel marginBottom={2} variant="h3">
              {capitalize(notification?.label ?? 'Unnamed Channel')}
            </Typography>
            <ClearIconButton handleClick={() => handleRemove(id)} />
          </Stack>
          <Stack alignItems="baseline" direction="row">
            <Typography data-qa-type variant="h3" width={100}>
              Type:
            </Typography>
            <Typography data-qa-channel-type variant="subtitle2">
              {
                channelTypeOptions.find(
                  (option) => option.value === notification?.channel_type
                )?.label
              }
            </Typography>
          </Stack>
          <Stack alignItems="baseline" direction="row">
            <Typography data-qa-to variant="h3" width={100}>
              To:
            </Typography>
            <Typography data-qa-channel-details variant="subtitle2">
              {notification && <RenderChannelDetails template={notification} />}
            </Typography>
          </Stack>
        </Box>
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.id === nextProps.id &&
        prevProps.notification.id === nextProps.notification.id
      );
    }
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ fieldState, formState }) => (
        <Stack mt={3} spacing={2}>
          <Typography variant="h2">4. Notification Channels</Typography>
          {(formState.isSubmitted || fieldState.isTouched) &&
            fieldState.error &&
            fieldState.error.message?.length && (
              <AlertListNoticeMessages
                errorMessage={fieldState.error.message}
                separator={MULTILINE_ERROR_SEPARATOR}
                variant="error"
              />
            )}
          {selectedNotifications.length > 0 && (
            <Stack spacing={2}>
              {selectedNotifications.map((notification, id) => (
                <NotificationChannelCard
                  id={id}
                  key={id}
                  notification={notification}
                />
              ))}
            </Stack>
          )}
          <Button
            buttonType="outlined"
            data-qa-buttons="true"
            disabled={notificationChannelWatcher.length === 5}
            onClick={handleOpenDrawer}
            size="medium"
            sx={{
              width:
                notificationChannelWatcher.length === 5 ? '215px' : '190px',
            }}
            tooltipText="You can add up to 5 notification channels."
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
        </Stack>
      )}
    />
  );
};
