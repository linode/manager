import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@linode/ui';
import { Typography } from '@linode/ui';
import { Autocomplete } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import { ChannelTypeOptions } from '../../constants';
import { notificationChannelSchema } from '../schemas';
import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannelForm } from '../types';
import type { ChannelTypes, NotificationChannel } from '@linode/api-v4';
import type { ObjectSchema } from 'yup';

interface AddNotificationChannelProps {
  /**
   * method to exit the Drawer on cancel
   * @returns void
   */
  onCancel: () => void;
  /**
   * method to add the notification id to the form context
   * @param notificationId id of the Notification that is being submitted
   * @returns void
   */
  onSubmitAddNotification: (notificationId: number) => void;
  /**
   * notification template data fetched from the api
   */
  templateData: NotificationChannel[];
}

export const AddNotificationChannel = (props: AddNotificationChannelProps) => {
  const { onCancel, onSubmitAddNotification, templateData } = props;

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
  const selectedTypeTemplate =
    channelTypeWatcher && templateData
      ? templateData.filter(
          (template) => template.channel_type === channelTypeWatcher
        )
      : null;

  const templateOptions = React.useMemo(() => {
    return selectedTypeTemplate
      ? selectedTypeTemplate.map((template) => ({
          label: template.label,
          value: template.label,
        }))
      : [];
  }, [selectedTypeTemplate]);

  const selectedTemplate = selectedTypeTemplate?.find(
    (template) => template.label === channelLabelWatcher
  );

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmit}>
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.name === 'light'
                ? theme.tokens.color.Neutrals[5]
                : theme.tokens.color.Neutrals.Black,
            borderRadius: 1,
            overflow: 'auto',
            p: 2,
          })}
        >
          <Typography
            sx={(theme) => ({
              color:
                theme.name === 'light'
                  ? theme.tokens.color.Neutrals.Black
                  : theme.tokens.color.Neutrals[5],
            })}
            gutterBottom
            variant="h3"
          >
            Channel Settings
          </Typography>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(
                  _,
                  newValue: { label: string; value: ChannelTypes },
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
                  ChannelTypeOptions.find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                data-testid="channel-type"
                errorText={fieldState.error?.message}
                label="Type"
                onBlur={field.onBlur}
                options={ChannelTypeOptions}
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
                  onChange={(
                    _,
                    selected: { label: string; value: string },
                    reason
                  ) => {
                    field.onChange(
                      reason === 'selectOption' ? selected.value : null
                    );
                  }}
                  value={
                    templateOptions.find(
                      (option) => option.value === field.value
                    ) ?? null
                  }
                  data-testid="channel-label"
                  disabled={!selectedTypeTemplate}
                  errorText={fieldState.error?.message}
                  key={channelTypeWatcher}
                  label="Channel"
                  onBlur={field.onBlur}
                  options={templateOptions}
                  placeholder="Select a Channel"
                />
              )}
              control={control}
              name="label"
            />
          </Box>
          {/* This is not the complete end solution, this is to satsify the current requirements of email type channels and the default email notification channel */}
          {selectedTemplate && selectedTemplate.channel_type === 'email' && (
            <Box paddingTop={2}>
              <Grid container>
                <Grid item md={1} sm={1} xs={2}>
                  <Typography variant="h3">To:</Typography>
                </Grid>
                <Grid
                  item
                  md="auto"
                  overflow="auto"
                  paddingRight={1}
                  sm="auto"
                  xs="auto"
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
