import { yupResolver } from '@hookform/resolvers/yup';
import { ActionsPanel, Paper, TextField, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useUpdateNotificationChannel } from 'src/queries/cloudpulse/alerts';

import {
  channelTypeOptions,
  UPDATE_CHANNEL_FAILED_MESSAGE,
  UPDATE_CHANNEL_SUCCESS_MESSAGE,
} from '../../constants';
import { NotificationChannelTypeSelect } from '../CreateChannel/NotificationChannelTypeSelect';
import { NotificationRecipients } from '../CreateChannel/NotificationRecipients';
import { createNotificationChannelSchema } from '../CreateChannel/schemas';
import { filterEditChannelFormValues } from './utilities';

import type { CreateNotificationChannelForm } from '../CreateChannel/types';
import type { NotificationChannel } from '@linode/api-v4';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

const CHANNEL_LANDING = '/alerts/notification-channels';
const pathname = '/Notification Channels/Edit';

const overrides: CrumbOverridesProps[] = [
  {
    label: 'Notification Channels',
    linkTo: CHANNEL_LANDING,
    position: 1,
  },
];

export interface EditNotificationChannelProps {
  /**
   * The details of the notification channel being edited.
   */
  channelData: NotificationChannel;
  /**
   * The channel ID being edited.
   */
  channelId: string;
}

export const EditNotificationChannel = (
  props: EditNotificationChannelProps
) => {
  const { channelData, channelId } = props;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateChannel } = useUpdateNotificationChannel();

  const formMethods = useForm<CreateNotificationChannelForm>({
    defaultValues: {
      name: channelData.label,
      type: channelData.channel_type,
      recipients:
        channelData.channel_type === 'email'
          ? (channelData.details?.email.usernames ?? [])
          : [],
    },
    mode: 'onBlur',
    resolver: yupResolver(createNotificationChannelSchema),
  });

  const { control, handleSubmit, formState } = formMethods;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateChannel(filterEditChannelFormValues(channelId, values));
      enqueueSnackbar(UPDATE_CHANNEL_SUCCESS_MESSAGE, {
        variant: 'success',
      });
      navigate({ to: CHANNEL_LANDING });
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          formMethods.setError(error.field, {
            message: error.reason ?? UPDATE_CHANNEL_FAILED_MESSAGE,
          });
        } else {
          enqueueSnackbar(error.reason ?? UPDATE_CHANNEL_FAILED_MESSAGE, {
            variant: 'error',
          });
        }
      }
    }
  });

  const handleCancel = () => {
    navigate({ to: CHANNEL_LANDING });
  };

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <Breadcrumb
        breadcrumbDataAttrs={{ 'data-testid': true }}
        crumbOverrides={overrides}
        pathname={pathname}
      />
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit}>
          <Typography marginTop={2} variant="h2">
            Channel Settings
          </Typography>
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <NotificationChannelTypeSelect
                disabled
                error={fieldState.error?.message}
                options={channelTypeOptions}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                data-testid="channel-name"
                errorText={fieldState.error?.message}
                label="Name"
                name="name"
                placeholder="Enter a name for the channel"
                value={field.value ?? ''}
              />
            )}
          />
          <Controller
            control={control}
            name="recipients"
            render={({ field, fieldState }) => (
              <NotificationRecipients
                error={fieldState.error?.message}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? []}
              />
            )}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'save-edit-channel',
              label: 'Save',
              loading: formState.isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel-edit-channel',
              label: 'Cancel',
              onClick: handleCancel,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormProvider>
    </Paper>
  );
};
