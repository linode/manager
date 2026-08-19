import { authenticationType, contentType } from '@linode/api-v4';
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
  getDestinationFormPendoId,
  mapAutocompleteOptionsWithPendo,
  renderOptionsWithPendo,
  useACLPLogsFlags,
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

interface DestinationCustomHttpsDetailsFormProps {
  controlPaths: {
    authenticationDetails: string;
    authenticationType: string;
    basicAuthenticationPassword: string;
    basicAuthenticationUser: string;
    bearerTokenAuthenticationHeaderName: string;
    bearerTokenAuthenticationTokenPrefix: string;
    bearerTokenAuthenticationValue: string;
    clientCaCertificate: string;
    clientCertificate: string;
    clientPrivateKey: string;
    clientPrivateKeyPassphrase: string;
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
  const { controlPaths, mode, entity } = props;
  const theme = useTheme();
  const { isACLPLogsBearerTokenAuthEnabled, isPrivateKeyPassphraseEnabled } =
    useACLPLogsFlags();

  const { control, setValue } = useFormContext();

  const selectedAuthenticationType = useWatch({
    control,
    name: controlPaths.authenticationType,
  });

  const pendoIdPrefix = `${getDestinationFormPendoId(entity, mode)}-`;
  const pendoIds = {
    [authenticationType.Basic]: `${pendoIdPrefix}Authentication Basic`,
    [authenticationType.BearerToken]: `${pendoIdPrefix}Authentication Bearer Token`,
    [authenticationType.None]: `${pendoIdPrefix}Authentication None`,
    [contentType.Json]: `${pendoIdPrefix}Json`,
    [contentType.JsonUtf8]: `${pendoIdPrefix}Json Utf8`,
  };
  const authenticationTypeOptionsWithPendos: AutocompleteOption[] =
    mapAutocompleteOptionsWithPendo(
      isACLPLogsBearerTokenAuthEnabled
        ? authenticationTypeOptions
        : authenticationTypeOptions.filter(
            ({ value }) => value != authenticationType.BearerToken
          ),
      pendoIds
    );

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
            options={authenticationTypeOptionsWithPendos}
            renderOption={renderOptionsWithPendo}
            textFieldProps={{
              labelTooltipText:
                'The authentication method used for requests sent to your HTTPS endpoint.',
              inputProps: {
                'data-pendo-id': `${pendoIdPrefix}Authentication Type`,
              },
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
        </>
      )}
      {isACLPLogsBearerTokenAuthEnabled &&
        selectedAuthenticationType === authenticationType.BearerToken && (
          <>
            <Controller
              control={control}
              name={controlPaths.bearerTokenAuthenticationValue}
              render={({ field, fieldState }) => (
                <HideShowText
                  aria-required
                  errorText={fieldState.error?.message}
                  inputProps={{
                    'data-pendo-id': `${pendoIdPrefix}Bearer Token`,
                  }}
                  label="Token"
                  labelTooltipText={
                    'This token is securely stored and can’t be viewed after it’s saved. Keep a copy in a secure location, as you’ll need to provide it again whenever you edit this destination.'
                  }
                  onBlur={field.onBlur}
                  onChange={(value) => field.onChange(value)}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name={controlPaths.bearerTokenAuthenticationHeaderName}
              render={({ field, fieldState }) => (
                <TextField
                  errorText={fieldState.error?.message}
                  inputProps={{
                    'data-pendo-id': `${pendoIdPrefix}Bearer Header Name`,
                  }}
                  label="Header Name"
                  labelTooltipText="The HTTP header used to send the token. If left blank, Authorization is used."
                  onBlur={field.onBlur}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  optional={true}
                  placeholder="Authorization"
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name={controlPaths.bearerTokenAuthenticationTokenPrefix}
              render={({ field, fieldState }) => (
                <TextField
                  errorText={fieldState.error?.message}
                  inputProps={{
                    'data-pendo-id': `${pendoIdPrefix}Bearer Token Prefix`,
                  }}
                  label="Token Prefix"
                  labelTooltipText="The text placed before the authentication token in the HTTP header. If left blank, Bearer is used."
                  onBlur={field.onBlur}
                  onChange={(value) => field.onChange(value)}
                  optional={true}
                  placeholder="Bearer"
                  value={field.value}
                />
              )}
            />
          </>
        )}
      <Stack alignItems="center" direction="row" flexWrap="nowrap" mt={2}>
        <Typography variant="h3">
          Client Certificate&nbsp;
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
          text="Certificate details are used to authenticate the audit log delivery service and verify the HTTPs destination during mutual TLS (mTLS) connections. This section is required only if the destination enforces client certificate authentication."
        />
      </Stack>
      <Controller
        control={control}
        name={controlPaths.tlsHostname}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}TLS Hostname`,
            }}
            label="TLS Hostname"
            labelTooltipText="The hostname used to verify the server’s certificate and matches the Subject Alternative Names (SANs) in the certificate. If not provided, the hostname is fetched from the endpoint URL."
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
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}Client Certificate`,
            }}
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
          <HideShowText
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}Private Key`,
            }}
            label="Client Private Key"
            labelTooltipText="The private key you want to use to authenticate to the backend server. Provide both the client certificate and the client private key in the non-encrypted PKCS8 format to use mutual authentication."
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
            value={field.value}
          />
        )}
      />
      {isPrivateKeyPassphraseEnabled && (
        <Controller
          control={control}
          name={controlPaths.clientPrivateKeyPassphrase}
          render={({ field, fieldState }) => (
            <HideShowText
              errorText={fieldState.error?.message}
              inputProps={{
                'data-pendo-id': `${pendoIdPrefix}Private Key Passphrase`,
              }}
              label="Private Key Passphrase"
              onBlur={field.onBlur}
              onChange={(value) => {
                field.onChange(value);
              }}
              value={field.value}
            />
          )}
        />
      )}
      <Controller
        control={control}
        name={controlPaths.clientCaCertificate}
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${pendoIdPrefix}Client Ca Certificate`,
            }}
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
