import {
  authenticationType,
  dataCompressionType,
  type DestinationType,
  destinationType,
} from '@linode/api-v4';
import { Autocomplete, Paper, TextField } from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  getDestinationTypeOption,
  getPendoPageId,
  isFormInEditMode,
  mapAutocompleteOptionsWithPendo,
  renderOptionsWithPendo,
  useIsACLPLogsEnabled,
} from 'src/features/Delivery/deliveryUtils';
import { DestinationAkamaiObjectStorageDetailsForm } from 'src/features/Delivery/Shared/DestinationAkamaiObjectStorageDetailsForm';
import { DestinationCustomHttpsDetailsForm } from 'src/features/Delivery/Shared/DestinationCustomHttpsDetailsForm';
import { FormSubmitBar } from 'src/features/Delivery/Shared/FormSubmitBar/FormSubmitBar';
import { destinationTypeOptions } from 'src/features/Delivery/Shared/types';
import { useVerifyDestination } from 'src/features/Delivery/Shared/useVerifyDestination';

import type {
  AutocompleteOption,
  DestinationFormType,
  FormMode,
} from 'src/features/Delivery/Shared/types';

interface DestinationFormProps {
  isSubmitting: boolean;
  mode: FormMode;
  onSubmit: SubmitHandler<DestinationFormType>;
}

const customHttpsDetailsControlPaths = {
  authenticationType: 'details.authentication.type',
  authenticationDetails: 'details.authentication.details',
  basicAuthenticationPassword:
    'details.authentication.details.basic_authentication_password',
  basicAuthenticationUser:
    'details.authentication.details.basic_authentication_user',
  clientCaCertificate:
    'details.client_certificate_details.client_ca_certificate',
  clientCertificate: 'details.client_certificate_details.client_certificate',
  clientPrivateKey: 'details.client_certificate_details.client_private_key',
  tlsHostname: 'details.client_certificate_details.tls_hostname',
  contentType: 'details.content_type',
  customHeaders: 'details.custom_headers',
  dataCompression: 'details.data_compression',
  endpointUrl: 'details.endpoint_url',
} as const;

export const DestinationForm = (props: DestinationFormProps) => {
  const { mode, isSubmitting, onSubmit } = props;

  const { isACLPLogsCustomHttpsEnabled } = useIsACLPLogsEnabled();
  const {
    verifyDestination,
    isPending: isVerifyingDestination,
    destinationVerified,
    setDestinationVerified,
  } = useVerifyDestination();

  const formRef = React.useRef<HTMLFormElement>(null);
  const { control, handleSubmit, getValues, reset } =
    useFormContext<DestinationFormType>();
  const destination = useWatch({
    control,
  }) as DestinationFormType;

  const pendoIdPrefix = `${getPendoPageId('destination', mode)}-`;
  const pendoIds = {
    [destinationType.CustomHttps]: `${pendoIdPrefix}Custom HTTPS`,
    [destinationType.AkamaiObjectStorage]: `${pendoIdPrefix}Akamai Object Storage`,
  };

  const destinationTypeOptionsWithPendo: AutocompleteOption[] =
    mapAutocompleteOptionsWithPendo(destinationTypeOptions, pendoIds);

  useEffect(() => {
    setDestinationVerified(false);
  }, [destination, setDestinationVerified]);

  const resetForm = (destType: DestinationType) => {
    const currentValues = getValues();
    const newDestinationDetails =
      destType === destinationType.AkamaiObjectStorage
        ? {
            path: '',
          }
        : {
            authentication: {
              type: authenticationType.None,
            },
            data_compression: dataCompressionType.Gzip,
          };

    reset({
      ...currentValues,
      type: destType,
      details: newDestinationDetails,
    });
  };

  return (
    <form id="destinationForm" ref={formRef}>
      <Grid container spacing={2}>
        <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
          <Paper>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Autocomplete
                  disableClearable
                  disabled={
                    isFormInEditMode(mode) || !isACLPLogsCustomHttpsEnabled
                  }
                  label="Destination Type"
                  onBlur={field.onBlur}
                  onChange={(_, { value }) => {
                    resetForm(value as DestinationType);
                    field.onChange(value);
                  }}
                  options={destinationTypeOptionsWithPendo}
                  renderOption={renderOptionsWithPendo}
                  textFieldProps={{
                    inputProps: {
                      'data-pendo-id': `${pendoIdPrefix}Destination Type`,
                    },
                  }}
                  value={getDestinationTypeOption(field.value)}
                />
              )}
            />
            <Controller
              control={control}
              name="label"
              render={({ field, fieldState }) => (
                <TextField
                  aria-required
                  errorText={fieldState.error?.message}
                  inputProps={{
                    'data-pendo-id': `${pendoIdPrefix}Destination Name`,
                  }}
                  label="Destination Name"
                  onBlur={field.onBlur}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                />
              )}
            />
            {destination.type === destinationType.AkamaiObjectStorage && (
              <DestinationAkamaiObjectStorageDetailsForm
                entity="destination"
                mode={mode}
              />
            )}
            {isACLPLogsCustomHttpsEnabled &&
              destination.type === destinationType.CustomHttps && (
                <DestinationCustomHttpsDetailsForm
                  controlPaths={customHttpsDetailsControlPaths}
                  entity="destination"
                  mode={mode}
                />
              )}
          </Paper>
        </Grid>
        <Grid size={{ lg: 3, md: 12, sm: 12, xs: 12 }}>
          <FormSubmitBar
            blockSubmit={true}
            connectionTested={destinationVerified}
            formType={'destination'}
            isSubmitting={isSubmitting}
            isTesting={isVerifyingDestination}
            mode={mode}
            onSubmit={handleSubmit(onSubmit, () =>
              scrollErrorIntoViewV2(formRef)
            )}
            onTestConnection={handleSubmit(
              () => verifyDestination(destination),
              () => scrollErrorIntoViewV2(formRef)
            )}
          />
        </Grid>
      </Grid>
    </form>
  );
};
