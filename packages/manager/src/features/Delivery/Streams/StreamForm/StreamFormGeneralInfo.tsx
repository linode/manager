import { streamType } from '@linode/api-v4';
import { useAccount } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Paper,
  SelectedIcon,
  TextField,
  Typography,
} from '@linode/ui';
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
  const { data: account } = useAccount();
  const isLkeEAuditLogsTypeSelectionDisabled = !account?.capabilities?.includes(
    'Akamai Cloud Pulse Logs LKE-E Audit'
  );

  const capitalizedMode = capitalize(mode);
  const description = {
    audit_logs:
      'Audit logs record state-changing operations on cloud resources and authentication events, delivered in CloudEvents JSON format.',
    lke_audit_logs:
      'Kubernetes API server audit logs capture state-changing operations on LKE-E cluster resources.',
  };
  const pendoIds = {
    audit_logs: `Logs Delivery Streams ${capitalizedMode}-Audit Logs`,
    lke_audit_logs: `Logs Delivery Streams ${capitalizedMode}-Kubernetes Audit Logs`,
  };

  const filteredStreamTypeOptions = isLkeEAuditLogsTypeSelectionDisabled
    ? streamTypeOptions.filter(({ value }) => value !== streamType.LKEAuditLogs)
    : streamTypeOptions;

  const streamTypeOptionsWithPendo: AutocompleteOption[] =
    filteredStreamTypeOptions.map((option) => ({
      ...option,
      pendoId: pendoIds[option.value as StreamType],
    }));

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
              'data-pendo-id': `Logs Delivery Streams ${capitalizedMode}-Name`,
            }}
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
            disabled={
              isFormInEditMode(mode) || isLkeEAuditLogsTypeSelectionDisabled
            }
            errorText={fieldState.error?.message}
            label="Stream Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
              updateStreamDetails(value);
            }}
            options={streamTypeOptionsWithPendo}
            renderOption={(props, option, { selected }) => {
              return (
                <li
                  {...props}
                  data-pendo-id={option.pendoId}
                  data-qa-option
                  key={props.key}
                >
                  <Box
                    sx={{
                      flexGrow: 1,
                    }}
                  >
                    {option.label}
                  </Box>
                  <SelectedIcon visible={selected} />
                </li>
              );
            }}
            textFieldProps={{
              inputProps: {
                'data-pendo-id': `Logs Delivery Streams ${capitalizedMode}-Stream Type`,
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
