import { Autocomplete, TextField } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import { getAuthenticationTypeOption } from 'src/features/Delivery/deliveryUtils';
import { authenticationTypeOptions } from 'src/features/Delivery/Shared/types';

import type { FormMode, FormType } from 'src/features/Delivery/Shared/types';

interface DestinationCustomHttpsDetailsFormProps {
  controlPaths?: {
    authenticationType: string;
    basicAuthenticationPassword: string;
    basicAuthenticationUser: string;
    clientCertificateDetails: string;
    contentType: string;
    customHeaders: string;
    dataCompression: string;
    endpointUrl: string;
  };
  entity: FormType;
  mode: FormMode;
}

const defaultPaths = {
  authenticationType: 'details.authentication.type',
  basicAuthenticationPassword:
    'details.authentication.details.basic_authentication_password',
  basicAuthenticationUser:
    'details.authentication.details.basic_authentication_user',
  clientCertificateDetails: 'details.client_certificate_details',
  contentType: 'details.content_type',
  customHeaders: 'details.custom_headers',
  dataCompression: 'details.data_compression',
  endpointUrl: 'details.endpoint_url',
};

export const DestinationCustomHttpsDetailsForm = (
  props: DestinationCustomHttpsDetailsFormProps
) => {
  const { controlPaths = defaultPaths } = props;

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
                placeholder="Username"
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
                placeholder="Password"
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
            placeholder="Endpoint URL"
            value={field.value}
          />
        )}
      />
    </>
  );
};
