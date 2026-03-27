import { authenticationType } from '@linode/api-v4';
import {
  Autocomplete,
  Divider,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
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
    authenticationDetails: string;
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

  const { control, setValue } = useFormContext();

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
            label="Authentication Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              if (value === authenticationType.None) {
                setValue(controlPaths.authenticationDetails, undefined);
              }
              field.onChange(value);
            }}
            options={authenticationTypeOptions}
            textFieldProps={{
              labelTooltipText:
                'The authentication method used for requests sent to your HTTPS endpoint.',
            }}
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
        Connection Settings
      </Typography>
      <Stack alignItems="center" direction="row" flexWrap="nowrap" mt={2}>
        <Typography variant="h3">
          Client Certificate Authentication&nbsp;
          <span
            style={{ fontWeight: theme.tokens.font.FontWeight.Regular.Normal }}
          >
            (optional)
          </span>
        </Typography>
        <TooltipIcon
          labelTooltipIconSize="small"
          status="info"
          sxTooltipIcon={{ p: 1 }}
          text="Certificate details are used to authenticate the audit log delivery service and verify the HTTPs destination during mutual TLS (mTLS( connections. This section is required only if the destination enforces client certificate authentication."
        />
      </Stack>
      <Controller
        control={control}
        name={controlPaths.tlsHostname}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            label="TLS Hostname"
            labelTooltipText="The hostname used to verify the server’s certificate and matches the Subject Alternative Names (SANs) in the certificate. If not provided, the hostname is fetched from the endpoint URL."
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
            labelTooltipText="The certification authority (CA) certificate used to verify the origin server’s certificate. If the certificate is not signed by a well-known certification authority, enter the CA certificate in the PEM format for verification."
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
            labelTooltipText="The digital certificate you want to use to authenticate requests to your destination. Provide both the client certificate and the client private key in the PEM format to use mutual authentication."
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
            label="Client Private Key"
            labelTooltipText="The private key you want to use to authenticate to the backend server. Provide both the client certificate and the client private key in the non-encrypted PKCS8 format to use mutual authentication."
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
            textFieldProps={{
              labelTooltipText:
                'The format and character encoding of the delivered audit log data.',
            }}
            value={field.value ? getContentTypeOption(field.value) : null}
          />
        )}
      />
      <CustomHeaders controlPath={controlPaths.customHeaders} />
    </>
  );
};
