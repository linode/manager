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

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { DestinationLinodeObjectStorageDetailsForm } from 'src/features/DataStream/Shared/DestinationLinodeObjectStorageDetailsForm';
import { destinationTypeOptions } from 'src/features/DataStream/Shared/types';
import { DestinationLinodeObjectStorageDetailsSummary } from 'src/features/DataStream/Streams/StreamCreate/Delivery/DestinationLinodeObjectStorageDetailsSummary';
import { type CreateStreamForm } from 'src/features/DataStream/Streams/StreamCreate/types';

import type {
  DestinationType,
  LinodeObjectStorageDetails,
} from '@linode/api-v4';

type DestinationName = {
  create?: boolean;
  id?: number;
  label: string;
  type?: DestinationType;
};

export const StreamCreateDelivery = () => {
  const theme = useTheme();
  const { control, setValue } = useFormContext<CreateStreamForm>();

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
    name: 'destination_type',
  });

  const selectedDestinations = useWatch({
    control,
    name: 'destinations',
  });

  const destinationNameFilterOptions = createFilterOptions<DestinationName>();

  const getDestinationForm = () => (
    <>
      <Controller
        control={control}
        name="destination_type"
        render={({ field }) => (
          <Autocomplete
            disableClearable
            disabled={true}
            label="Destination Type"
            onChange={(_, { value }) => {
              field.onChange(value);
            }}
            options={destinationTypeOptions}
            value={getDestinationTypeOption(field.value)}
          />
        )}
        rules={{ required: true }}
      />
      <Controller
        control={control}
        name="destination_label"
        render={({ field }) => (
          <Autocomplete
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
            onChange={(_, newValue) => {
              const selectedExistingDestination = !!(
                newValue?.label && newValue?.id
              );
              if (selectedExistingDestination) {
                setValue('destinations', [newValue?.id as number]);
              }
              field.onChange(newValue?.label || newValue);
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
        rules={{ required: true }}
      />
      {selectedDestinationType === destinationType.LinodeObjectStorage && (
        <>
          {showDestinationForm && <DestinationLinodeObjectStorageDetailsForm />}
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
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h2">Delivery</Typography>
        <DocsLink
          // TODO: Change the link when proper documentation is ready
          href="https://techdocs.akamai.com/cloud-computing/docs"
          label="Docs"
        />
      </Box>
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
