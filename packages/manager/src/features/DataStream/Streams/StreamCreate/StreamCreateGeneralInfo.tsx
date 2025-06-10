import { Autocomplete, Box, Paper, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useStyles } from 'src/features/DataStream/DataStream.styles';

import { type CreateStreamForm, StreamType } from './types';

export const StreamCreateGeneralInfo = () => {
  const { control } = useFormContext<CreateStreamForm>();
  const { classes } = useStyles();

  const streamTypeOptions = [
    {
      value: StreamType.AuditLogs,
      label: 'Audit Logs',
    },
    {
      value: StreamType.ErrorLogs,
      label: 'Error Logs',
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
            className={classes.input}
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
      <Box alignItems="flex-end" display="flex">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Autocomplete
              className={classes.input}
              disableClearable
              label="Stream Type"
              onChange={(_, { value }) => {
                field.onChange(value);
              }}
              options={streamTypeOptions}
              value={streamTypeOptions.find(
                ({ value }) => value === field.value
              )}
            />
          )}
          rules={{ required: true }}
        />
      </Box>
    </Paper>
  );
};
