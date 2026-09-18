import { authenticationType, contentType } from '@linode/api-v4';
import {
  Autocomplete,
  Divider,
  Select,
  TextField,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import {
  getAuthenticationTypeOption,
  getContentTypeOption,
  getDestinationFormPendoId,
  mapAutocompleteOptionsWithPendo,
  renderOptionsWithPendo,
} from 'src/features/Delivery/deliveryUtils';
import { CustomHeaders } from 'src/features/Delivery/Shared/CustomHeaders';
import {
  authenticationTypeOptions,
  contentTypeOptions,
} from 'src/features/Delivery/Shared/types';

import type {
  AutocompleteOption,
  FormMode,
  FormType,
} from 'src/features/Delivery/Shared/types';

interface DestinationTrafficPeakDetailsFormProps {
  controlPaths?: {
    authenticationDetails: string;
    basicAuthenticationPassword: string;
    basicAuthenticationUser: string;
    contentType: string;
    customHeaders: string;
    dataCompression: string;
    endpointUrl: string;
  };
  entity: FormType;
  mode: FormMode;
}

const defaultControlPaths = {
  authenticationDetails: 'details.authentication.details',
  basicAuthenticationPassword:
    'details.authentication.details.basic_authentication_password',
  basicAuthenticationUser:
    'details.authentication.details.basic_authentication_user',
  contentType: 'details.content_type',
  customHeaders: 'details.custom_headers',
  dataCompression: 'details.data_compression',
  endpointUrl: 'details.endpoint_url',
} as const;

export const DestinationTrafficPeakDetailsForm = (
  props: DestinationTrafficPeakDetailsFormProps
) => {
  const { controlPaths = defaultControlPaths, mode, entity } = props;
  const theme = useTheme();

  const { control } = useFormContext();

  const pendoIdPrefix = `${getDestinationFormPendoId(entity, mode)}-`;
  const pendoIds = {
    [contentType.Json]: `${pendoIdPrefix}Json`,
    [contentType.JsonUtf8]: `${pendoIdPrefix}Json Utf8`,
  };

  const contentTypeOptionsWithPendo: AutocompleteOption[] =
    mapAutocompleteOptionsWithPendo(contentTypeOptions, pendoIds);

  return (
    <>
      <Controller
        control={control}
        name={controlPaths.endpointUrl}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}Endpoint URL`,
            }}
            label="Endpoint URL"
            labelTooltipText="The HTTPS endpoint for audit log delivery."
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
            value={field.value}
          />
        )}
      />
      <Divider sx={{ my: 3 }} />
      <Typography sx={{ mt: 0 }} variant="h2">
        Advanced Settings
      </Typography>
      <Select
        disabled
        label="Authentication Type"
        options={authenticationTypeOptions}
        value={getAuthenticationTypeOption(authenticationType.Basic)}
      />
      <Controller
        control={control}
        name={controlPaths.basicAuthenticationUser}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}Username`,
            }}
            label="Username"
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
        name={controlPaths.basicAuthenticationPassword}
        render={({ field, fieldState }) => (
          <HideShowText
            aria-required
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}Password`,
            }}
            label="Password"
            onBlur={field.onBlur}
            onChange={(value) => field.onChange(value)}
            value={field.value}
          />
        )}
      />
      <Typography sx={{ mt: 2 }} variant="h3">
        HTTPS Headers&nbsp;
        <span
          style={{ fontWeight: theme.tokens.font.FontWeight.Regular.Normal }}
        >
          (optional)
        </span>
      </Typography>
      <Controller
        control={control}
        name={controlPaths.contentType}
        render={({ field, fieldState }) => (
          <Autocomplete
            errorText={fieldState.error?.message}
            label="Content Type"
            onBlur={field.onBlur}
            onChange={(_, value) => {
              field.onChange(value?.value || null);
            }}
            options={contentTypeOptionsWithPendo}
            renderOption={renderOptionsWithPendo}
            textFieldProps={{
              labelTooltipText:
                'The format and character encoding of the delivered audit log data.',
              inputProps: {
                'data-pendo-id': `${pendoIdPrefix}Content Type`,
              },
            }}
            value={field.value ? getContentTypeOption(field.value) : null}
          />
        )}
      />
      <CustomHeaders
        controlPath={controlPaths.customHeaders}
        entity={entity}
        mode={mode}
      />
    </>
  );
};
