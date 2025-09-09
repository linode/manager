import { streamType } from '@linode/api-v4';
import { Autocomplete, Paper, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { type CreateStreamAndDestinationForm } from './types';

export const StreamCreateGeneralInfo = () => {
  const { control, setValue } =
    useFormContext<CreateStreamAndDestinationForm>();

  const streamTypeOptions = [
    {
      value: streamType.AuditLogs,
      label: 'Audit Logs',
    },
    {
      value: streamType.LKEAuditLogs,
      label: 'Kubernetes Audit Logs',
    },
  ];

  const updateStreamDetails = (value: string) => {
    if (value === streamType.LKEAuditLogs) {
      setValue('stream.details.is_auto_add_all_clusters_enabled', false);
    } else {
      setValue('stream.details', {});
    }
  };

  return (
    <Paper>
      <Typography variant="h2">General Information</Typography>
      <Controller
        control={control}
        name="stream.label"
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            errorText={fieldState.error?.message}
            label="Name"
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
            placeholder="Stream name..."
            value={field.value}
          />
        )}
        rules={{ required: true }}
      />
      <Controller
        control={control}
        name="stream.type"
        render={({ field, fieldState }) => (
          <Autocomplete
            disableClearable
            errorText={fieldState.error?.message}
            label="Stream Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
              updateStreamDetails(value);
            }}
            options={streamTypeOptions}
            value={streamTypeOptions.find(({ value }) => value === field.value)}
          />
        )}
        rules={{ required: true }}
      />
    </Paper>
  );
};
