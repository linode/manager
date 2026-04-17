import {
  authenticationType,
  dataCompressionType,
  destinationType,
} from '@linode/api-v4';
import { useAllDestinationsQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  CircleProgress,
  ErrorState,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { createFilterOptions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  getDestinationTypeOption,
  getPendoPageId,
  mapAutocompleteOptionsWithPendo,
  renderOptionsWithPendo,
  useIsACLPLogsEnabled,
} from 'src/features/Delivery/deliveryUtils';
import { DestinationAkamaiObjectStorageDetailsForm } from 'src/features/Delivery/Shared/DestinationAkamaiObjectStorageDetailsForm';
import { DestinationCustomHttpsDetailsForm } from 'src/features/Delivery/Shared/DestinationCustomHttpsDetailsForm';
import {
  type AutocompleteOption,
  destinationTypeOptions,
} from 'src/features/Delivery/Shared/types';
import { DestinationAkamaiObjectStorageDetailsSummary } from 'src/features/Delivery/Streams/StreamForm/Delivery/DestinationAkamaiObjectStorageDetailsSummary';
import { DestinationCustomHTTPSDetailsSummary } from 'src/features/Delivery/Streams/StreamForm/Delivery/DestinationCustomHTTPSDetailsSummary';

import type {
  AkamaiObjectStorageDetails,
  AkamaiObjectStorageDetailsExtended,
  CustomHTTPSDetails,
  CustomHTTPSDetailsExtended,
  DestinationType,
} from '@linode/api-v4';
import type { FormMode } from 'src/features/Delivery/Shared/types';
import type { StreamAndDestinationFormType } from 'src/features/Delivery/Streams/StreamForm/types';

interface DestinationName {
  create?: boolean;
  id?: number;
  label: string;
  pendoId?: string;
  type?: DestinationType;
}

const akamaiObjectStorageDetailsControlPaths = {
  accessKeyId: 'destination.details.access_key_id',
  accessKeySecret: 'destination.details.access_key_secret',
  bucketName: 'destination.details.bucket_name',
  host: 'destination.details.host',
  path: 'destination.details.path',
} as const;

const customHttpsDetailsControlPaths = {
  authenticationType: 'destination.details.authentication.type',
  authenticationDetails: 'destination.details.authentication.details',
  basicAuthenticationPassword:
    'destination.details.authentication.details.basic_authentication_password',
  basicAuthenticationUser:
    'destination.details.authentication.details.basic_authentication_user',
  clientCertificateDetails: 'destination.details.client_certificate_details',
  clientCaCertificate:
    'destination.details.client_certificate_details.client_ca_certificate',
  clientCertificate:
    'destination.details.client_certificate_details.client_certificate',
  clientPrivateKey:
    'destination.details.client_certificate_details.client_private_key',
  tlsHostname: 'destination.details.client_certificate_details.tls_hostname',
  contentType: 'destination.details.content_type',
  customHeaders: 'destination.details.custom_headers',
  dataCompression: 'destination.details.data_compression',
  endpointUrl: 'destination.details.endpoint_url',
} as const;

interface StreamFormDeliveryProps {
  mode: FormMode;
  setDisableTestConnection: (disable: boolean) => void;
}

export const StreamFormDelivery = (props: StreamFormDeliveryProps) => {
  const { mode, setDisableTestConnection } = props;

  const { isACLPLogsCustomHttpsEnabled } = useIsACLPLogsEnabled();
  const theme = useTheme();
  const { control, setValue, getValues, reset } =
    useFormContext<StreamAndDestinationFormType>();
  const { data: destinations, isLoading, error } = useAllDestinationsQuery();

  const [creatingNewDestination, setCreatingNewDestination] =
    useState<boolean>(false);

  useEffect(() => {
    setDisableTestConnection(isLoading || !!error || !creatingNewDestination);
  }, [isLoading, error, setDisableTestConnection, creatingNewDestination]);

  const destinationNameOptions: DestinationName[] = (destinations || []).map(
    ({ id, label, type }) => ({
      id,
      label,
      type,
    })
  );

  const selectedDestinationType = useWatch({
    control,
    name: 'destination.type',
  });

  const selectedDestinations = useWatch({
    control,
    name: 'stream.destinations',
  });

  const pendoIdPrefix = `${getPendoPageId('stream', mode)}-`;
  const pendoIds = {
    [destinationType.CustomHttps]: `${pendoIdPrefix}Custom HTTPS`,
    [destinationType.AkamaiObjectStorage]: `${pendoIdPrefix}Akamai Object Storage`,
  };
  const destinationTypeOptionsWithPendo: AutocompleteOption[] =
    mapAutocompleteOptionsWithPendo(destinationTypeOptions, pendoIds);

  const destinationNameFilterOptions = createFilterOptions<DestinationName>({
    stringify: (destination) => destination.label,
  });

  const findDestination = (id: number) =>
    destinations?.find((destination) => destination.id === id);

  const resetDestinationForm = (
    destType: DestinationType,
    destinationLabel?: null | string
  ) => {
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
            client_certificate_details: {
              client_ca_certificate: '',
              client_certificate: '',
              client_private_key: '',
              tls_hostname: '',
            },
            data_compression: dataCompressionType.Gzip,
          };

    reset({
      stream: {
        ...currentValues.stream,
        destinations: [],
      },
      destination: {
        ...currentValues.destination,
        label: destinationLabel || '',
        details: newDestinationDetails,
      },
    });
  };

  const getDestinationForm = () => (
    <>
      <Controller
        control={control}
        name="destination.type"
        render={({ field, fieldState }) => (
          <Autocomplete
            disableClearable
            disabled={!isACLPLogsCustomHttpsEnabled}
            errorText={fieldState.error?.message}
            label="Destination Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
              resetDestinationForm(value as DestinationType);
              setCreatingNewDestination(false);
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
        name="destination.label"
        render={({ field, fieldState }) => (
          <Autocomplete
            errorText={fieldState.error?.message}
            filterOptions={(options, params) => {
              const filtered = destinationNameFilterOptions(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                ({ label }) => inputValue === label
              );

              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  create: true,
                  label: inputValue,
                  type: selectedDestinationType,
                  pendoId: `${pendoIdPrefix}Destination Name-New`,
                });
              }

              return filtered;
            }}
            getOptionLabel={(option) => option.label}
            label="Destination Name"
            onBlur={field.onBlur}
            onChange={(_, newValue) => {
              const id = newValue?.id;

              if (id === undefined && selectedDestinations.length > 0) {
                resetDestinationForm(
                  selectedDestinationType,
                  (newValue?.label || newValue) as null | string
                );
              }

              if (id) {
                setValue('stream.destinations', [id]);
                const selectedDestination = findDestination(id);
                if (selectedDestination) {
                  setValue(
                    'destination.details',
                    selectedDestinationType ===
                      destinationType.AkamaiObjectStorage
                      ? (selectedDestination.details as AkamaiObjectStorageDetailsExtended)
                      : (selectedDestination.details as CustomHTTPSDetailsExtended)
                  );
                }
              }

              field.onChange(newValue?.label || newValue);
              setCreatingNewDestination(!!newValue?.create);
            }}
            options={destinationNameOptions.filter(
              ({ type }) => type === selectedDestinationType
            )}
            placeholder="Select existing or enter new destination"
            renderOption={(props, option) => {
              const { id, ...optionProps } = props;
              return (
                <li data-pendo-id={option.pendoId} {...optionProps} key={id}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Stack direction="column">
                      <Box
                        sx={{
                          fontWeight: theme.tokens.font.FontWeight.Semibold,
                        }}
                      >
                        {option.create ? (
                          <span>
                            <strong>Create&nbsp;</strong> &quot;{option.label}
                            &quot;
                          </span>
                        ) : (
                          option.label
                        )}
                      </Box>
                      {option.id && (
                        <Box
                          sx={{
                            color:
                              theme.tokens.component.Dropdown.Text.Description,
                          }}
                        >
                          ID: {option.id}
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </li>
              );
            }}
            textFieldProps={{
              inputProps: {
                'data-pendo-id': `${pendoIdPrefix}Destination Name`,
              },
              labelTooltipText:
                'Select an existing destination from the list or create a new one by entering a name and clicking Create.',
            }}
            value={field.value ? { label: field.value } : null}
          />
        )}
      />
      {selectedDestinationType === destinationType.AkamaiObjectStorage && (
        <>
          {creatingNewDestination && !selectedDestinations?.length && (
            <DestinationAkamaiObjectStorageDetailsForm
              controlPaths={akamaiObjectStorageDetailsControlPaths}
              entity="stream"
              mode={mode}
            />
          )}
          {findDestination(selectedDestinations?.[0])?.details && (
            <DestinationAkamaiObjectStorageDetailsSummary
              {...(findDestination(selectedDestinations[0])
                ?.details as AkamaiObjectStorageDetails)}
            />
          )}
        </>
      )}
      {isACLPLogsCustomHttpsEnabled &&
        selectedDestinationType === destinationType.CustomHttps && (
          <>
            {creatingNewDestination && !selectedDestinations?.length && (
              <DestinationCustomHttpsDetailsForm
                controlPaths={customHttpsDetailsControlPaths}
                entity="stream"
                mode={mode}
              />
            )}
            {findDestination(selectedDestinations?.[0])?.details && (
              <DestinationCustomHTTPSDetailsSummary
                {...(findDestination(selectedDestinations[0])
                  ?.details as CustomHTTPSDetails)}
              />
            )}
          </>
        )}
    </>
  );

  return (
    <Paper>
      <Typography variant="h2">Delivery</Typography>
      <Typography
        sx={{
          mt: theme.spacingFunction(12),
          maxWidth: 440,
          whiteSpace: 'preserve-spaces',
        }}
      >
        Choose the destination where logs will be delivered. Select a
        preconfigured destination or create a new one.
      </Typography>
      {isLoading && (
        <Box display="flex" justifyContent="center">
          <CircleProgress size="md" />
        </Box>
      )}
      {error && (
        <ErrorState
          compact
          errorText="There was an error retrieving destinations. Please reload and try again."
        />
      )}
      {!isLoading && !error && getDestinationForm()}
    </Paper>
  );
};
