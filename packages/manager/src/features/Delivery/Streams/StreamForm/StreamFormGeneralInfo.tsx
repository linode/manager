import { streamType } from '@linode/api-v4';
import { Autocomplete, Paper, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import {
  getStreamTypeOption,
  isFormInEditMode,
} from 'src/features/Delivery/deliveryUtils';
import { streamTypeOptions } from 'src/features/Delivery/Shared/types';

import type { StreamAndDestinationFormType } from './types';
import type { FormMode } from 'src/features/Delivery/Shared/types';

interface StreamFormGeneralInfoProps {
  mode: FormMode;
  streamId?: string;
}

export const StreamFormGeneralInfo = (props: StreamFormGeneralInfoProps) => {
  const { mode } = props;

  const { control, setValue } = useFormContext<StreamAndDestinationFormType>();

  const updateStreamDetails = (value: string) => {
    if (value === streamType.LKEAuditLogs) {
      setValue('stream.details.is_auto_add_all_clusters_enabled', false);
    } else {
      setValue('stream.details', null);
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
            placeholder="Stream name"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="stream.type"
        render={({ field, fieldState }) => (
          <Autocomplete
            disableClearable
            disabled={isFormInEditMode(mode)}
            errorText={fieldState.error?.message}
            label="Stream Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
              updateStreamDetails(value);
            }}
            options={streamTypeOptions}
            value={getStreamTypeOption(field.value)}
          />
        )}
      />
    </Paper>
  );
};
