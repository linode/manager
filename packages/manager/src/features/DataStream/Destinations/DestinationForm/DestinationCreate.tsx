import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType } from '@linode/api-v4';
import { useCreateDestinationMutation } from '@linode/queries';
import { destinationSchema } from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { DestinationForm } from 'src/features/DataStream/Destinations/DestinationForm/DestinationForm';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { LandingHeaderProps } from 'src/components/LandingHeader';
import type { DestinationFormType } from 'src/features/DataStream/Shared/types';

export const DestinationCreate = () => {
  const { mutateAsync: createDestination, isPending: isCreatingDestination } =
    useCreateDestinationMutation();
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

  const form = useForm<DestinationFormType>({
    defaultValues: {
      type: destinationType.LinodeObjectStorage,
      details: {
        region: '',
      },
    },
    mode: 'onBlur',
    resolver: yupResolver(destinationSchema),
  });

  const onSubmit = () => {
    const destination = form.getValues();

    createDestination(destination)
      .then(() => {
        navigate({ to: '/datastream/destinations' });
        return enqueueSnackbar(
          `Destination  ${destination.label} created successfully`,
          {
            variant: 'success',
          }
        );
      })
      .catch((error) => {
        const { field, reason } = getAPIErrorOrDefault(
          error,
          'There was an issue creating your destination'
        )[0];

        const message = field ? `${field}: ${reason}` : reason;
        return enqueueSnackbar(message, {
          variant: 'error',
        });
      });
  };

  return (
    <>
      <DocumentTitleSegment segment="Create Destination" />
      <LandingHeader {...landingHeaderProps} />
      <FormProvider {...form}>
        <DestinationForm
          isSubmitting={isCreatingDestination}
          mode="create"
          onSubmit={onSubmit}
        />
      </FormProvider>
    </>
  );
};
