import { streamType } from '@linode/api-v4';
import { Autocomplete, Paper, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import {
  getStreamTypeOption,
  isFormInEditMode,
} from 'src/features/DataStream/dataStreamUtils';
import { LabelValue } from 'src/features/DataStream/Shared/LabelValue';
import { streamTypeOptions } from 'src/features/DataStream/Shared/types';

import type { StreamAndDestinationFormType } from './types';
import type { FormMode } from 'src/features/DataStream/Shared/types';

type StreamFormGeneralInfoProps = {
  mode: FormMode;
  streamId?: string;
};

export const StreamFormGeneralInfo = (props: StreamFormGeneralInfoProps) => {
  const { mode, streamId } = props;

  const { control, setValue } = useFormContext<StreamAndDestinationFormType>();

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
      {streamId && <LabelValue compact={true} label="ID" value={streamId} />}
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
        rules={{ required: true }}
      />
    </Paper>
  );
};
