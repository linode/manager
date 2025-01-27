import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, Box, Typography } from '@linode/ui';
import React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import { channelTypeOptions } from '../../constants';
import { getAlertBoxStyles } from '../../Utils/utils';
import { notificationChannelSchema } from '../schemas';

import type { NotificationChannelForm } from '../types';
import type { ChannelType, NotificationChannel } from '@linode/api-v4';
import type { ObjectSchema } from 'yup';
import Grid from '@mui/material/Grid';
import { RenderChannelDetails } from './RenderChannelDetails';

interface AddNotificationChannelProps {
  /**
   * Boolean for the Notification channels api error response
   */
  isNotificationChannelsError: boolean;
  /**
   * Boolean for the Notification channels api loading response
   */
  isNotificationChannelsLoading: boolean;
  /**
   * Method to exit the Drawer on cancel
   * @returns void
   */
  onCancel: () => void;
  /**
   * Method to add the notification id to the form context
   * @param notificationId id of the Notification that is being submitted
   * @returns void
   */
  onSubmitAddNotification: (notificationId: number) => void;
  /**
   * Notification template data fetched from the api
   */
  templateData: NotificationChannel[];
}

export const AddNotificationChannel = (props: AddNotificationChannelProps) => {
  const {
    isNotificationChannelsError,
    isNotificationChannelsLoading,
    onCancel,
    onSubmitAddNotification,
    templateData,
  } = props;

  const formMethods = useForm<NotificationChannelForm>({
    defaultValues: {
      channel_type: null,
      label: null,
    },
    mode: 'onBlur',
    resolver: yupResolver(
      notificationChannelSchema as ObjectSchema<NotificationChannelForm>
    ),
  });

  const { control, handleSubmit, setValue } = formMethods;
  const onSubmit = handleSubmit(() => {
    onSubmitAddNotification(selectedTemplate?.id ?? 0);
  });

  const channelTypeWatcher = useWatch({ control, name: 'channel_type' });
  const channelLabelWatcher = useWatch({ control, name: 'label' });
  const selectedChannelTypeTemplate =
    channelTypeWatcher && templateData
      ? templateData.filter(
          (template) => template.channel_type === channelTypeWatcher
        )
      : null;

  const selectedTemplate = selectedChannelTypeTemplate?.find(
    (template) => template.label === channelLabelWatcher
  );

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmit}>
        <Box
          sx={(theme) => ({
            ...getAlertBoxStyles(theme),
            borderRadius: 1,
            overflow: 'auto',
            p: 2,
          })}
        >
          <Typography
            sx={(theme) => ({
              color: theme.tokens.content.Text,
            })}
            gutterBottom
            variant="h3"
          >
            Channel Settings
          </Typography>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                disabled={
                  isNotificationChannelsLoading && !isNotificationChannelsError
                }
                errorText={
                  fieldState.error?.message ??
                  (isNotificationChannelsError
                    ? 'Error in fetching the data.'
                    : '')
                }
                onChange={(
                  _,
                  newValue: { label: string; value: ChannelType },
                  reason
                ) => {
                  field.onChange(
                    reason === 'selectOption' ? newValue.value : null
                  );
                  if (reason !== 'selectOption') {
                    setValue('label', null);
                  }
                }}
                value={
                  channelTypeOptions.find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                data-testid="channel-type"
                label="Type"
                onBlur={field.onBlur}
                options={channelTypeOptions}
                placeholder="Select a Type"
              />
            )}
            control={control}
            name="channel_type"
          />
          <Box>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  onChange={(_, selected: { label: string }, reason) => {
                    field.onChange(
                      reason === 'selectOption' ? selected.label : null
                    );
                  }}
                  value={
                    selectedChannelTypeTemplate?.find(
                      (option) => option.label === field.value
                    ) ?? null
                  }
                  data-testid="channel-label"
                  disabled={!selectedChannelTypeTemplate}
                  errorText={fieldState.error?.message}
                  key={channelTypeWatcher}
                  label="Channel"
                  onBlur={field.onBlur}
                  options={selectedChannelTypeTemplate ?? []}
                  placeholder="Select a Channel"
                />
              )}
              control={control}
              name="label"
            />
          </Box>          
          {selectedTemplate && selectedTemplate.channel_type === 'email' && (
            <Box paddingTop={2}>
              <Grid container>
                <Grid item md={1} sm={1} xs={2}>
                  <Typography variant="h3">To:</Typography>
                </Grid>
                <Grid item md="auto" overflow="auto" paddingRight={1} xs={12}>
                  <RenderChannelDetails template={selectedTemplate} />
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Add channel',
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onCancel,
          }}
        />
      </form>
    </FormProvider>
  );
}; 