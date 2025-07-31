import { destinationType } from '@linode/api-v4';
import { Autocomplete, Paper, Typography } from '@linode/ui';
import { createFilterOptions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { DestinationLinodeObjectStorageDetailsForm } from 'src/features/DataStream/Shared/DestinationLinodeObjectStorageDetailsForm';
import { destinationTypeOptions } from 'src/features/DataStream/Shared/types';

import { type CreateStreamAndDestinationForm } from './types';

type DestinationName = {
  create?: boolean;
  id?: number;
  label: string;
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
    name: 'destination.type',
  });

  const destinationNameFilterOptions = createFilterOptions<DestinationName>();

  return (
    <Paper>
      <Typography variant="h2">Delivery</Typography>
      <Typography sx={{ mt: theme.spacingFunction(12) }}>
        Define a destination where you want this stream to send logs.
      </Typography>
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
                });
              }

              return filtered;
            }}
            getOptionLabel={(option) => option.label}
            label="Destination Name"
            onBlur={field.onBlur}
            onChange={(_, newValue) => {
              field.onChange(newValue?.label || newValue);
              setValue('stream.destinations', [newValue?.id as number]);
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
      />
      {showDestinationForm &&
        selectedDestinationType === destinationType.LinodeObjectStorage && (
          <DestinationLinodeObjectStorageDetailsForm
            controlPaths={controlPaths}
          />
        )}
    </Paper>
  );
};
