import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Typography } from '@linode/ui';
import { Paper } from '@mui/material';
import React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';

import { NotificationChannelTypeSelect } from './NotificationChannelTypeSelect';
import { createNotificationChannelSchema } from './schemas';

import type { CreateNotificationChannelForm } from './types';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

const overrides: CrumbOverridesProps[] = [
  {
    label: 'Notification Channels',
    linkTo: '/alerts/notification-channels',
    position: 1,
  },
];

const initialValues: CreateNotificationChannelForm = {
  type: null,
  name: '',
};

export const CreateNotificationChannel = () => {
  const formMethods = useForm<CreateNotificationChannelForm>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(createNotificationChannelSchema),
  });

  const { control, resetField } = formMethods;

  const channelTypeWatcher = useWatch({ control, name: 'type' });

  // reset the name field when the channel type changes
  const handleChannelTypeChange = React.useCallback(() => {
    resetField('name', { defaultValue: '' });
  }, [resetField]);

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <Breadcrumb
        crumbOverrides={overrides}
        pathname="/NotificationChannels/Create Channel"
      />
      <FormProvider {...formMethods}>
        <form>
          <Typography marginTop={2} variant="h2">
            Channel Settings
          </Typography>
          <NotificationChannelTypeSelect
            handleChannelTypeChange={handleChannelTypeChange}
            name="type"
          />
          {channelTypeWatcher && (
            <Controller
              control={control}
              key={channelTypeWatcher}
              name="name"
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
        </form>
      </FormProvider>
    </Paper>
  );
};
