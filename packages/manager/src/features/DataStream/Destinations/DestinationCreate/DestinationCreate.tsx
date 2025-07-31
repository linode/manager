import { destinationType } from '@linode/api-v4';
import { Autocomplete, Box, Button, Paper, TextField } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { DestinationLinodeObjectStorageDetailsForm } from 'src/features/DataStream/Shared/DestinationLinodeObjectStorageDetailsForm';
import { destinationTypeOptions } from 'src/features/DataStream/Shared/types';

import type { LandingHeaderProps } from 'src/components/LandingHeader';
import type { CreateStreamForm } from 'src/features/DataStream/Streams/StreamCreate/types';

export const DestinationCreate = () => {
  const theme = useTheme();

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/datastream/destinations/create',
      crumbOverrides: [
        {
          label: 'DataStream',
          linkTo: '/datastream/destinations',
          position: 1,
        },
      ],
    },
    removeCrumbX: 2,
    title: 'Create Destination',
  };

  const form = useForm<CreateStreamForm>({
    defaultValues: {
      destination_type: destinationType.LinodeObjectStorage,
      region: '',
    },
  });
  const { control, handleSubmit } = form;

  const selectedDestinationType = useWatch({
    control,
    name: 'destination_type',
  });

  const onSubmit = handleSubmit(async () => {});

  return (
    <>
      <DocumentTitleSegment segment="Create Destination" />
      <LandingHeader {...landingHeaderProps} />
      <Paper>
        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
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
                <TextField
                  aria-required
                  label="Destination Name"
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder="Destination Name..."
                  value={field.value}
                />
              )}
              rules={{ required: true }}
            />
            {selectedDestinationType ===
              destinationType.LinodeObjectStorage && (
              <DestinationLinodeObjectStorageDetailsForm />
            )}
          </form>
        </FormProvider>
      </Paper>
      <Box
        alignItems="center"
        display="flex"
        flexWrap="wrap"
        justifyContent="flex-end"
      >
        <Button
          buttonType="primary"
          sx={{ mt: theme.spacingFunction(16) }}
          type="submit"
        >
          Create Destination
        </Button>
      </Box>
    </>
  );
};
