import { streamType } from '@linode/api-v4';
import { Autocomplete, Paper, TextField, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  getPendoPageId,
  getStreamTypeOption,
  isFormInEditMode,
  mapAutocompleteOptionsWithPendo,
  renderOptionsWithPendo,
  useIsLkeEAuditLogsTypeSelectionEnabled,
} from 'src/features/Delivery/deliveryUtils';
import { streamTypeOptions } from 'src/features/Delivery/Shared/types';

import type { StreamAndDestinationFormType } from './types';
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
  const isLkeEAuditLogsTypeSelectionDisabled =
    !useIsLkeEAuditLogsTypeSelectionEnabled();

  const pendoIdPrefix = `${getPendoPageId('stream', mode)}-`;
  const description = {
    audit_logs:
      'Audit logs record state-changing operations on cloud resources and authentication events, and are delivered in CloudEvents JSON format.',
    lke_audit_logs:
      'Kubernetes API server audit logs capture state-changing operations on LKE-E cluster resources, and are delivered in native Kubernetes audit format.',
  };
  const pendoIds = {
    audit_logs: `${pendoIdPrefix}Audit Logs`,
    lke_audit_logs: `${pendoIdPrefix}Kubernetes Audit Logs`,
  };

  const filteredStreamTypeOptions = isLkeEAuditLogsTypeSelectionDisabled
    ? streamTypeOptions.filter(({ value }) => value !== streamType.LKEAuditLogs)
    : streamTypeOptions;

  const streamTypeOptionsWithPendo: AutocompleteOption[] =
    mapAutocompleteOptionsWithPendo(filteredStreamTypeOptions, pendoIds);

  const selectedStreamType = useWatch({
    control,
    name: 'stream.type',
  });

  const updateStreamDetails = (value: string) => {
    if (value === streamType.LKEAuditLogs) {
      setValue('stream.details', {
        cluster_ids: [],
        is_auto_add_all_clusters_enabled: false,
      });
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
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}Name`,
            }}
            label="Stream Name"
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
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
            disabled={
              isFormInEditMode(mode) || isLkeEAuditLogsTypeSelectionDisabled
            }
            errorText={fieldState.error?.message}
            label="Stream Type"
            onBlur={field.onBlur}
            onChange={(_, { value }: AutocompleteOption) => {
              field.onChange(value);
              updateStreamDetails(value);
            }}
            options={streamTypeOptionsWithPendo}
            renderOption={renderOptionsWithPendo}
            textFieldProps={{
              inputProps: {
                'data-pendo-id': `${pendoIdPrefix}Stream Type`,
              },
            }}
            value={getStreamTypeOption(field.value)}
          />
        )}
      />
      <Typography
        sx={{
          mt: theme.spacingFunction(16),
          maxWidth: 440,
          whiteSpace: 'preserve-spaces',
        }}
      >
        {description[selectedStreamType]}
      </Typography>
    </Paper>
  );
};
