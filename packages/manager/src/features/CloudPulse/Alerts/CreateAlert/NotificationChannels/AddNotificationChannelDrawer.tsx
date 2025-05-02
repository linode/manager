import { yupResolver } from '@hookform/resolvers/yup';
import {
  ActionsPanel,
  Autocomplete,
  Box,
  Drawer,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { NotFound } from 'src/components/NotFound';

import { channelTypeOptions } from '../../constants';
import { getAlertBoxStyles } from '../../Utils/utils';
import { notificationChannelSchema } from '../schemas';
import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannelForm } from '../types';
import type { ChannelType, NotificationChannel } from '@linode/api-v4';
import type { ObjectSchema } from 'yup';

interface AddNotificationChannelDrawerProps {
  /**
   * Method to exit the Drawer on cancel
   * @returns void
   */
  handleCloseDrawer: () => void;
  /**
   * Boolean for the Notification channels api error response
   */
  isNotificationChannelsError: boolean;
  /**
   * Boolean for the Notification channels api loading response
   */
  isNotificationChannelsLoading: boolean;
  /**
   * Method to add the notification id to the form context
   * @param notificationId id of the Notification that is being submitted
   * @returns void
   */
  onSubmitAddNotification: (notificationId: number) => void;
  /**
   * Boolean to determine if the Drawer is open
   */
  open: boolean;
  /**
   * Notification template data fetched from the api
   */
  templateData: NotificationChannel[];
}

export const AddNotificationChannelDrawer = (
  props: AddNotificationChannelDrawerProps
) => {
  const {
    handleCloseDrawer,
    isNotificationChannelsError,
    isNotificationChannelsLoading,
    onSubmitAddNotification,
    open,
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

  const { control, handleSubmit, reset, setValue } = formMethods;
  const onSubmit = handleSubmit(() => {
    if (selectedTemplate) {
      onSubmitAddNotification(selectedTemplate.id);
      reset();
    }
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

  const resetDrawer = () => {
    handleCloseDrawer();
    reset();
  };

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={resetDrawer}
      open={open}
      title="Add Notification Channel"
    >
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
              gutterBottom
              sx={(theme) => ({
                color: theme.tokens.alias.Content.Text,
              })}
              variant="h3"
            >
              Channel Settings
            </Typography>
            <Controller
              control={control}
              name="channel_type"
              render={({ field, fieldState }) => (
                <Autocomplete
                  data-testid="channel-type"
                  disabled={
                    isNotificationChannelsLoading &&
                    !isNotificationChannelsError
                  }
                  errorText={
                    fieldState.error?.message ??
                    (isNotificationChannelsError
                      ? 'Error in fetching the data.'
                      : '')
                  }
                  label="Type"
                  onBlur={field.onBlur}
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
                  options={channelTypeOptions}
                  placeholder="Select a Type"
                  value={
                    channelTypeOptions.find(
                      (option) => option.value === field.value
                    ) ?? null
                  }
                />
              )}
            />
            <Box>
              <Controller
                control={control}
                name="label"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    data-testid="channel-label"
                    disabled={!selectedChannelTypeTemplate}
                    errorText={fieldState.error?.message}
                    key={channelTypeWatcher}
                    label="Channel"
                    onBlur={field.onBlur}
                    onChange={(_, selected: { label: string }, reason) => {
                      field.onChange(
                        reason === 'selectOption' ? selected.label : null
                      );
                    }}
                    options={selectedChannelTypeTemplate ?? []}
                    placeholder="Select a Channel"
                    slotProps={{
                      popper: {
                        placement: 'bottom',
                      },
                    }}
                    value={
                      selectedChannelTypeTemplate?.find(
                        (option) => option.label === field.value
                      ) ?? null
                    }
                  />
                )}
              />
            </Box>
            {selectedTemplate && selectedTemplate.channel_type === 'email' && (
              <Box paddingTop={2}>
                <Grid container>
                  <Grid item md={1} sm={1} xs={2}>
                    <Typography variant="h3">To:</Typography>
                  </Grid>
                  <Grid
                    item
                    md="auto"
                    sx={{
                      overflow: 'auto',
                      paddingRight: 1,
                    }}
                    xs={12}
                  >
                    <RenderChannelDetails template={selectedTemplate} />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
          <ActionsPanel
            primaryButtonProps={{
              label: 'Add channel',
              onClick: onSubmit,
              type: 'button',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: resetDrawer,
            }}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};
