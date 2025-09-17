import { streamType } from '@linode/api-v4';
import { Autocomplete, Paper, TextField, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  getStreamTypeOption,
  isFormInEditMode,
} from 'src/features/Delivery/deliveryUtils';
import { streamTypeOptions } from 'src/features/Delivery/Shared/types';

import type { StreamAndDestinationFormType } from './types';
import type { StreamType } from '@linode/api-v4';
import type {
  AutocompleteOption,
  FormMode,
} from 'src/features/Delivery/Shared/types';

interface StreamFormGeneralInfoProps {
  mode: FormMode;
  streamId?: string;
}

export const StreamFormGeneralInfo = (props: StreamFormGeneralInfoProps) => {
  const { mode } = props;

  const theme = useTheme();
  const { control, setValue } = useFormContext<StreamAndDestinationFormType>();

  const capitalizedMode = capitalize(mode);
  const description = {
    audit_logs:
      'Configuration and authentication audit logs that capture state-changing operations (mutations) on Linode cloud infrastructure resources and IAM authentication events. Delivered in cloudevents.io JSON format.',
    lke_audit_logs:
      'Kubernetes API server audit logs that capture state-changing operations (mutations) on LKE-E cluster resources.',
  };
  const pendoIds = {
    audit_logs: `Logs Delivery Streams ${capitalizedMode}-Audit Logs`,
    lke_audit_logs: `Logs Delivery Streams ${capitalizedMode}-Kubernetes Audit Logs`,
  };
  const streamTypeOptionsWithPendo: AutocompleteOption[] =
    streamTypeOptions.map((option) => ({
      ...option,
      pendoId: pendoIds[option.value as StreamType],
    }));

  const selectedStreamType = useWatch({
    control,
    name: 'stream.type',
  });

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
            data-pendo-id={`Logs Delivery Streams ${capitalizedMode}-Name`}
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
            data-pendo-id={`Logs Delivery Streams ${capitalizedMode}-Stream Type`}
            disableClearable
            disabled={isFormInEditMode(mode)}
            errorText={fieldState.error?.message}
            label="Stream Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
              updateStreamDetails(value);
            }}
            options={streamTypeOptionsWithPendo}
            value={getStreamTypeOption(field.value)}
          />
        )}
      />
      <Typography
        sx={{
          mt: theme.spacingFunction(16),
          maxWidth: 480,
        }}
      >
        {description[selectedStreamType]}
      </Typography>
    </Paper>
  );
};
