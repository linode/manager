import { Autocomplete, Box, Paper, Typography } from '@linode/ui';
import { createFilterOptions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DestinationLinodeObjectStorageDetailsForm } from 'src/features/DataStream/Shared/DestinationLinodeObjectStorageDetailsForm';
import {
  destinationType,
  destinationTypeOptions,
} from 'src/features/DataStream/Shared/types';

import { type CreateStreamForm } from './types';

type DestinationName = {
  create?: boolean;
  id?: number;
  label: string;
};

export const StreamCreateDelivery = () => {
  const theme = useTheme();
  const { control } = useFormContext<CreateStreamForm>();

  const [showDestinationForm, setShowDestinationForm] =
    React.useState<boolean>(false);

  const destinationNameOptions: DestinationName[] = [
    {
      id: 1,
      label: 'Destination 1',
    },
    {
      id: 2,
      label: 'Destination 2',
    },
  ];

  const selectedDestinationType = useWatch({
    control,
    name: 'destination_type',
  });

  const destinationNameFilterOptions = createFilterOptions<DestinationName>();

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
            value={destinationTypeOptions.find(
              ({ value }) => value === field.value
            )}
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
                });
              }

              return filtered;
            }}
            getOptionLabel={(option) => option.label}
            label="Destination Name"
            onChange={(_, newValue) => {
              field.onChange(newValue?.label || newValue);
              setShowDestinationForm(!!newValue?.create);
            }}
            options={destinationNameOptions}
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
      {showDestinationForm &&
        selectedDestinationType === destinationType.LinodeObjectStorage && (
          <DestinationLinodeObjectStorageDetailsForm />
        )}
    </Paper>
  );
};
