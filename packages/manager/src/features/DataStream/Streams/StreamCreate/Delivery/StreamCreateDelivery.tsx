import { destinationType } from '@linode/api-v4';
import { useAllDestinationsQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  CircleProgress,
  ErrorState,
  Paper,
  Typography,
} from '@linode/ui';
import { createFilterOptions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { DestinationLinodeObjectStorageDetailsForm } from 'src/features/DataStream/Shared/DestinationLinodeObjectStorageDetailsForm';
import { destinationTypeOptions } from 'src/features/DataStream/Shared/types';
import { DestinationLinodeObjectStorageDetailsSummary } from 'src/features/DataStream/Streams/StreamCreate/Delivery/DestinationLinodeObjectStorageDetailsSummary';

import type {
  DestinationType,
  LinodeObjectStorageDetails,
} from '@linode/api-v4';
import type { CreateStreamAndDestinationForm } from 'src/features/DataStream/Streams/StreamCreate/types';

type DestinationName = {
  create?: boolean;
  id?: number;
  label: string;
  type?: DestinationType;
};

const controlPaths = {
  accessKeyId: 'destination.details.access_key_id',
  accessKeySecret: 'destination.details.access_key_secret',
  bucketName: 'destination.details.bucket_name',
  host: 'destination.details.host',
  path: 'destination.details.path',
  region: 'destination.details.region',
};

export const StreamCreateDelivery = () => {
  const theme = useTheme();
  const { control, setValue } =
    useFormContext<CreateStreamAndDestinationForm>();

  const [showDestinationForm, setShowDestinationForm] =
    React.useState<boolean>(false);
  const [showExistingDestination, setShowExistingDestination] =
    React.useState<boolean>(false);

  const { data: destinations, isLoading, error } = useAllDestinationsQuery();
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

  const destinationNameFilterOptions = createFilterOptions<DestinationName>();

  const getDestinationForm = () => (
    <>
      <Controller
        control={control}
        name="destination.type"
        render={({ field, fieldState }) => (
          <Autocomplete
            disableClearable
            disabled={true}
            errorText={fieldState.error?.message}
            label="Destination Type"
            onBlur={field.onBlur}
            onChange={(_, { value }) => {
              field.onChange(value);
            }}
            options={destinationTypeOptions}
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
                });
              }

              return filtered;
            }}
            getOptionLabel={(option) => option.label}
            label="Destination Name"
            onBlur={field.onBlur}
            onChange={(_, newValue) => {
              const selectedExistingDestination = !!(
                newValue?.label && newValue?.id
              );
              if (selectedExistingDestination) {
                setValue('stream.destinations', [newValue?.id as number]);
              }
              field.onChange(newValue?.label || newValue);
              setValue('stream.destinations', [newValue?.id as number]);
              setShowDestinationForm(!!newValue?.create);
              setShowExistingDestination(selectedExistingDestination);
            }}
            options={destinationNameOptions.filter(
              ({ type }) => type === selectedDestinationType
            )}
            placeholder="Create or Select Destination Name"
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  {option.create ? (
                    <>
                      <strong>Create&nbsp;</strong> &quot;{option.label}&quot;
                    </>
                  ) : (
                    option.label
                  )}
                </li>
              );
            }}
            value={field.value ? { label: field.value } : null}
          />
        )}
      />
      {selectedDestinationType === destinationType.LinodeObjectStorage && (
        <>
          {showDestinationForm && (
            <DestinationLinodeObjectStorageDetailsForm
              controlPaths={controlPaths}
            />
          )}
          {showExistingDestination && (
            <DestinationLinodeObjectStorageDetailsSummary
              {...(destinations?.find(
                ({ id }) => id === selectedDestinations[0]
              )?.details as LinodeObjectStorageDetails)}
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
