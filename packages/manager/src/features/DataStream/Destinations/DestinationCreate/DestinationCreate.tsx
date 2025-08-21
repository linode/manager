import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType } from '@linode/api-v4';
import { useCreateDestinationMutation } from '@linode/queries';
import { Autocomplete, Box, Button, Paper, TextField } from '@linode/ui';
import { createDestinationSchema } from '@linode/validation';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { DestinationLinodeObjectStorageDetailsForm } from 'src/features/DataStream/Shared/DestinationLinodeObjectStorageDetailsForm';
import { destinationTypeOptions } from 'src/features/DataStream/Shared/types';

import type { LandingHeaderProps } from 'src/components/LandingHeader';
import type { CreateDestinationForm } from 'src/features/DataStream/Shared/types';

export const DestinationCreate = () => {
  const theme = useTheme();
  const { mutateAsync: createDestination } = useCreateDestinationMutation();
  const navigate = useNavigate();

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

  const form = useForm<CreateDestinationForm>({
    defaultValues: {
      type: destinationType.LinodeObjectStorage,
      details: {
        region: '',
      },
    },
    mode: 'onBlur',
    resolver: yupResolver(createDestinationSchema),
  });
  const { control, handleSubmit } = form;

  const selectedDestinationType = useWatch({
    control,
    name: 'type',
  });

  const onSubmit = () => {
    const payload = form.getValues();
    createDestination(payload).then(() => {
      navigate({ to: '/datastream/destinations' });
    });
  };

  return (
    <>
      <DocumentTitleSegment segment="Create Destination" />
      <LandingHeader {...landingHeaderProps} />
      <Paper>
        <FormProvider {...form}>
          <form id="createDestinationForm" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Autocomplete
                  disableClearable
                  disabled={true}
                  label="Destination Type"
                  onBlur={field.onBlur}
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
              name="label"
              render={({ field, fieldState }) => (
                <TextField
                  aria-required
                  errorText={fieldState.error?.message}
                  label="Destination Name"
                  onBlur={field.onBlur}
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
          form="createDestinationForm"
          sx={{ mt: theme.spacingFunction(16) }}
          type="submit"
        >
          Create Destination
        </Button>
      </Box>
    </>
  );
};
