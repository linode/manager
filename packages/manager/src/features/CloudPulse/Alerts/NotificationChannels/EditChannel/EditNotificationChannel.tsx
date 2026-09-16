import { yupResolver } from '@hookform/resolvers/yup';
import { ActionsPanel, Paper, TextField, Typography } from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
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
import { NotificationChannelWebhook } from '../CreateChannel/NotificationChannelWebhook';
import { NotificationRecipients } from '../CreateChannel/NotificationRecipients';
import { createNotificationChannelSchema } from '../CreateChannel/schemas';
import { normalizeFieldPath } from '../CreateChannel/utilities';
import {
  filterEditChannelFormValues,
  getEditChannelFormValues,
} from './utilities';

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
  channelId: number;
}

export const EditNotificationChannel = (
  props: EditNotificationChannelProps
) => {
  const { channelData, channelId } = props;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isWebhookConnectionVerified, setIsWebhookConnectionVerified] =
    React.useState(false);

  const { mutateAsync: updateChannel } = useUpdateNotificationChannel();

  const formMethods = useForm<CreateNotificationChannelForm>({
    defaultValues: getEditChannelFormValues(channelData),
    mode: 'onBlur',
    resolver: yupResolver(createNotificationChannelSchema),
  });

  const { control, handleSubmit, formState } = formMethods;

  const handleRecipientsError = React.useCallback(() => {
    formMethods.resetField('details.email.usernames', { defaultValue: [] });
  }, [formMethods]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateChannel(filterEditChannelFormValues(channelId, values));
      enqueueSnackbar(UPDATE_CHANNEL_SUCCESS_MESSAGE, {
        variant: 'success',
      });
      navigate({ to: CHANNEL_LANDING });
    } catch (apiErrors) {
      let hasFieldError = false;

      for (const apiError of apiErrors) {
        if (apiError.field) {
          hasFieldError = true;
          formMethods.setError(
            normalizeFieldPath<CreateNotificationChannelForm>(apiError.field),
            {
              message: apiError.reason ?? UPDATE_CHANNEL_FAILED_MESSAGE,
            }
          );
        } else {
          enqueueSnackbar(apiError.reason ?? UPDATE_CHANNEL_FAILED_MESSAGE, {
            variant: 'error',
          });
        }
      }

      if (hasFieldError) {
        scrollErrorIntoViewV2(formRef);
      }
    }
  });

  const handleCancel = () => {
    navigate({ to: CHANNEL_LANDING });
  };

  return (
    <Paper
      data-pendo-id="monitor-alerts-notification-channels-edit-page"
      sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}
    >
      <Breadcrumb
        breadcrumbDataAttrs={{ 'data-testid': true }}
        crumbOverrides={overrides}
        pathname={pathname}
      />
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit} ref={formRef}>
          <Typography marginTop={2} variant="h2">
            Channel Settings
          </Typography>
          <Controller
            control={control}
            name="channel_type"
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
            name="label"
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
          {channelData.channel_type === 'email' && (
            <Controller
              control={control}
              name="details.email.usernames"
              render={({ field, fieldState }) => (
                <NotificationRecipients
                  error={fieldState.error?.message}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  onError={handleRecipientsError}
                  value={field.value ?? []}
                />
              )}
            />
          )}
          {channelData.channel_type === 'webhook' && (
            <NotificationChannelWebhook
              action="editing"
              formRef={formRef}
              isConnectionVerified={isWebhookConnectionVerified}
              name="details.webhook"
              onConnectionVerificationChange={setIsWebhookConnectionVerified}
            />
          )}

          <ActionsPanel
            primaryButtonProps={{
              disabled:
                channelData.channel_type === 'webhook' &&
                !isWebhookConnectionVerified,
              'data-testid': 'save-edit-channel',
              'data-pendo-id':
                'monitor-alerts-notification-channels-edit-Submit',
              label: 'Save',
              loading: formState.isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel-edit-channel',
              'data-pendo-id':
                'monitor-alerts-notification-channels-edit-Cancel',
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
