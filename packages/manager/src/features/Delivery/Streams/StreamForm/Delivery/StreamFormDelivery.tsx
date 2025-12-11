import { destinationType } from '@linode/api-v4';
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
import { capitalize } from '@linode/utilities';
import { createFilterOptions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';
import { DestinationAkamaiObjectStorageDetailsForm } from 'src/features/Delivery/Shared/DestinationAkamaiObjectStorageDetailsForm';
import { destinationTypeOptions } from 'src/features/Delivery/Shared/types';
import { DestinationAkamaiObjectStorageDetailsSummary } from 'src/features/Delivery/Streams/StreamForm/Delivery/DestinationAkamaiObjectStorageDetailsSummary';

import type {
  AkamaiObjectStorageDetails,
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

const controlPaths = {
  accessKeyId: 'destination.details.access_key_id',
  accessKeySecret: 'destination.details.access_key_secret',
  bucketName: 'destination.details.bucket_name',
  host: 'destination.details.host',
  path: 'destination.details.path',
} as const;

interface StreamFormDeliveryProps {
  mode: FormMode;
  setDisableTestConnection: (disable: boolean) => void;
}

export const StreamFormDelivery = (props: StreamFormDeliveryProps) => {
  const { mode, setDisableTestConnection } = props;

  const theme = useTheme();
  const { control, setValue, clearErrors } =
    useFormContext<StreamAndDestinationFormType>();
  const { data: destinations, isLoading, error } = useAllDestinationsQuery();

  const capitalizedMode = capitalize(mode);

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

  const destinationNameFilterOptions = createFilterOptions<DestinationName>({
    stringify: (destination) => destination.label,
  });

  const findDestination = (id: number) =>
    destinations?.find((destination) => destination.id === id);

  const restDestinationForm = () => {
    Object.values(controlPaths).forEach((controlPath) =>
      setValue(controlPath, '')
    );
  };

  const getDestinationForm = () => (
    <>
      <Controller
        control={control}
        name="destination.type"
        render={({ field, fieldState }) => (
          <Autocomplete
            disableClearable
            disabled
            errorText={fieldState.error?.message}
            label="Destination Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
            }}
            options={destinationTypeOptions}
            textFieldProps={{
              inputProps: {
                'data-pendo-id': `Logs Delivery Streams ${capitalizedMode}-Destination Type`,
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
                  pendoId: `Logs Delivery Streams ${capitalizedMode}-Destination Name-New`,
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
                restDestinationForm();
              }

              setValue('stream.destinations', id ? [id] : []);
              const selectedDestination = id ? findDestination(id) : undefined;
              if (selectedDestination) {
                setValue('destination.details', {
                  ...selectedDestination.details,
                  access_key_secret: '',
                });
              } else {
                clearErrors('destination.details');
              }

              field.onChange(newValue?.label || newValue);
              setCreatingNewDestination(!!newValue?.create);
            }}
            options={destinationNameOptions.filter(
              ({ type }) => type === selectedDestinationType
            )}
            placeholder="Create or Select Destination Name"
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
                'data-pendo-id': `Logs Delivery Streams ${capitalizedMode}-Destination Name`,
              },
            }}
            value={field.value ? { label: field.value } : null}
          />
        )}
      />
      {selectedDestinationType === destinationType.AkamaiObjectStorage && (
        <>
          {creatingNewDestination && !selectedDestinations?.length && (
            <DestinationAkamaiObjectStorageDetailsForm
              controlPaths={controlPaths}
              entity="stream"
              mode={mode}
            />
          )}
          {selectedDestinations?.[0] && (
            <DestinationAkamaiObjectStorageDetailsSummary
              {...(findDestination(selectedDestinations[0])
                ?.details as AkamaiObjectStorageDetails)}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <Paper>
      <Typography variant="h2">Delivery</Typography>
      <Typography sx={{ mt: theme.spacingFunction(12) }}>
        Define a destination where you want this stream to send logs.
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
