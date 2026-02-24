import { yupResolver } from '@hookform/resolvers/yup';
import { ActionsPanel, TextField, Typography } from '@linode/ui';
import { Paper } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useCreateNotificationChannel } from 'src/queries/cloudpulse/alerts';

import {
  channelTypeOptions,
  CREATE_CHANNEL_FAILED_MESSAGE,
  CREATE_CHANNEL_SUCCESS_MESSAGE,
} from '../../constants';
import { NotificationChannelTypeSelect } from './NotificationChannelTypeSelect';
import { NotificationRecipients } from './NotificationRecipients';
import { createNotificationChannelSchema } from './schemas';
import { filterCreateChannelFormValues } from './utilities';

import type { CreateNotificationChannelForm } from './types';
import type { ChannelType } from '@linode/api-v4';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

const overrides: CrumbOverridesProps[] = [
  {
    label: 'Notification Channels',
    linkTo: '/alerts/notification-channels',
    position: 1,
  },
];

const initialValues: CreateNotificationChannelForm = {
  channel_type: null,
  label: '',
  details: {
    email: {
      usernames: [],
    },
  },
};

export const CreateNotificationChannel = () => {
  const navigate = useNavigate();
  // Navigate to the notification channels listing page on exit, e.g. on cancel or successful save
  const createChannelExit = () => {
    navigate({ to: '/alerts/notification-channels' });
  };

  const formMethods = useForm<CreateNotificationChannelForm>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(createNotificationChannelSchema),
  });

  const {
    control,
    resetField,
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = formMethods;

  const channelTypeWatcher = useWatch({ control, name: 'channel_type' });

  const { mutateAsync: createChannel } = useCreateNotificationChannel();

  const { enqueueSnackbar } = useSnackbar();

  // submit the form and create the notification channel on success and show snackbar message on success or failure
  const onSubmit = handleSubmit(async (values) => {
    try {
      await createChannel(filterCreateChannelFormValues(values));
      enqueueSnackbar(CREATE_CHANNEL_SUCCESS_MESSAGE, {
        variant: 'success',
      });
      createChannelExit();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, {
            message: error.reason ?? CREATE_CHANNEL_FAILED_MESSAGE,
          });
        } else {
          enqueueSnackbar(error.reason ?? CREATE_CHANNEL_FAILED_MESSAGE, {
            variant: 'error',
          });
        }
      }
    }
  });

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <Breadcrumb
        breadcrumbDataAttrs={{
          'data-qa-breadcrumb': true,
        }}
        crumbOverrides={overrides}
        pathname="/NotificationChannels/Create Channel"
      />
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit}>
          <Typography
            data-qa-header="Channel Settings"
            marginTop={2}
            variant="h2"
          >
            Channel Settings
          </Typography>
          <Controller
            control={control}
            name="channel_type"
            render={({ field, fieldState }) => {
              // Reset the name field when the channel type changes
              const handleChannelTypeChange = (value: ChannelType | null) => {
                field.onChange(value);
                resetField('label', { defaultValue: '' });
                resetField('details.email.usernames', { defaultValue: [] });
              };

              return (
                <NotificationChannelTypeSelect
                  error={fieldState.error?.message}
                  handleChannelTypeChange={handleChannelTypeChange}
                  onBlur={field.onBlur}
                  options={channelTypeOptions}
                  value={field.value}
                />
              );
            }}
          />
          {channelTypeWatcher && (
            <Controller
              control={control}
              key={channelTypeWatcher}
              name="label"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  data-testid="alert-name"
                  errorText={fieldState.error?.message}
                  label="Name"
                  placeholder="Enter a name for the channel"
                  value={field.value ?? ''}
                />
              )}
            />
          )}
          {channelTypeWatcher === 'email' && (
            <Controller
              control={control}
              name="details.email.usernames"
              render={({ field, fieldState }) => (
                <NotificationRecipients
                  error={fieldState.error?.message}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value ?? []}
                />
              )}
            />
          )}
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: createChannelExit,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormProvider>
    </Paper>
  );
};
