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
  onCancel: () => void;
  onSubmitAddNotification: (notificationId: number) => void;
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

  const { control, handleSubmit } = formMethods;
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
            p: 2,
          })}
        >
          <Typography
            gutterBottom
            sx={(theme) => ({ color: theme.color.black })}
            variant="body2"
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
                  if (reason === 'selectOption') {
                    field.onChange(newValue?.value);
                  }

                  if (reason === 'clear') {
                    field.onChange(null);
                  }
                }}
                value={
                  field.value !== null
                    ? ChannelTypeOptions.find(
                        (option) => option.value === field.value
                      )
                    : null
                }
                data-testid="channel-type"
                errorText={fieldState.error?.message}
                label="Type"
                onBlur={field.onBlur}
                options={ChannelTypeOptions}
              />
            )}
            control={control}
            name="channel_type"
          />
          <Box>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  onChange={(_, selected, reason) => {
                    if (reason === 'selectOption') {
                      field.onChange(selected?.value);
                    }

                    if (reason === 'clear') {
                      field.onChange(null);
                    }
                  }}
                  value={
                    field.value !== null
                      ? templateOptions.find(
                          (option) => option.value === field.value
                        )
                      : null
                  }
                  data-testid="channel-label"
                  disabled={selectedTypeTemplate === null}
                  errorText={fieldState.error?.message}
                  key={channelTypeWatcher}
                  label="Channel"
                  onBlur={field.onBlur}
                  options={templateOptions}
                />
              )}
              control={control}
              name="label"
            />
          </Box>

          {selectedTemplate && (
            <Box paddingTop={2}>
              <Grid container>
                <Grid item md={2}>
                  <Typography variant="h3">To:</Typography>
                </Grid>
                <Grid item md={10}>
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
