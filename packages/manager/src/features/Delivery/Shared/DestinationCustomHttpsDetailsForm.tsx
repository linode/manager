import { Autocomplete, Divider, TextField, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import {
  getAuthenticationTypeOption,
  getContentTypeOption,
} from 'src/features/Delivery/deliveryUtils';
import { CustomHeaders } from 'src/features/Delivery/Shared/CustomHeaders';
import {
  authenticationTypeOptions,
  contentTypeOptions,
} from 'src/features/Delivery/Shared/types';

import type { FormMode, FormType } from 'src/features/Delivery/Shared/types';

interface DestinationCustomHttpsDetailsFormProps {
  controlPaths: {
    authenticationType: string;
    basicAuthenticationPassword: string;
    basicAuthenticationUser: string;
    clientCaCertificate: string;
    clientCertificate: string;
    clientPrivateKey: string;
    contentType: string;
    customHeaders: string;
    dataCompression: string;
    endpointUrl: string;
    tlsHostname: string;
  };
  entity: FormType;
  mode: FormMode;
}

export const DestinationCustomHttpsDetailsForm = (
  props: DestinationCustomHttpsDetailsFormProps
) => {
  const { controlPaths } = props;
  const theme = useTheme();

  const { control } = useFormContext();

  const selectedAuthenticationType = useWatch({
    control,
    name: controlPaths.authenticationType,
  });

  return (
    <>
      <Controller
        control={control}
        name={controlPaths.authenticationType}
        render={({ field, fieldState }) => (
          <Autocomplete
            disableClearable
            errorText={fieldState.error?.message}
            label="Authentication"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
            }}
            options={authenticationTypeOptions}
            value={getAuthenticationTypeOption(field.value)}
          />
        )}
      />
      {selectedAuthenticationType === 'basic' && (
        <>
          <Controller
            control={control}
            name={controlPaths.basicAuthenticationUser}
            render={({ field, fieldState }) => (
              <TextField
                aria-required
                errorText={fieldState.error?.message}
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
                label="Password"
                onBlur={field.onBlur}
                onChange={(value) => field.onChange(value)}
                value={field.value}
              />
            )}
          />
        </>
      )}
      <Controller
        control={control}
        name={controlPaths.endpointUrl}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            errorText={fieldState.error?.message}
            label="Endpoint URL"
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
        Additional Options
      </Typography>
      <Typography sx={{ mt: 2 }} variant="h3">
        Client Certificate&nbsp;
        <span
          style={{ fontWeight: theme.tokens.font.FontWeight.Regular.Normal }}
        >
          (optional)
        </span>
      </Typography>
      <Controller
        control={control}
        name={controlPaths.tlsHostname}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            label="TLS Hostname"
            multiline
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
        name={controlPaths.clientCaCertificate}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            label="CA Certificate"
            multiline
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
        name={controlPaths.clientCertificate}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            label="Client Certificate"
            multiline
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
        name={controlPaths.clientPrivateKey}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            label="Client Key"
            multiline
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
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
            options={contentTypeOptions}
            value={field.value ? getContentTypeOption(field.value) : null}
          />
        )}
      />
      <CustomHeaders controlPath={controlPaths.customHeaders} />
    </>
  );
};
