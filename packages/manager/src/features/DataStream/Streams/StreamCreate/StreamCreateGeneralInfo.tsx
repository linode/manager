import { Autocomplete, Paper, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { type CreateStreamForm, streamType } from './types';

export const StreamCreateGeneralInfo = () => {
  const { control } = useFormContext<CreateStreamForm>();

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

  return (
    <Paper>
      <Typography variant="h2">General Information</Typography>
      <Controller
        control={control}
        name="label"
        render={({ field }) => (
          <TextField
            aria-required
            label="Name"
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
        name="type"
        render={({ field }) => (
          <Autocomplete
            disableClearable
            label="Stream Type"
            onChange={(_, { value }) => {
              field.onChange(value);
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
