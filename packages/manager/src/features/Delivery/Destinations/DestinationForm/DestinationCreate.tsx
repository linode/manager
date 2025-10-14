import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType } from '@linode/api-v4';
import { useCreateDestinationMutation } from '@linode/queries';
import { destinationFormSchema } from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { getDestinationPayloadDetails } from 'src/features/Delivery/deliveryUtils';
import { DestinationForm } from 'src/features/Delivery/Destinations/DestinationForm/DestinationForm';

import type { CreateDestinationPayload } from '@linode/api-v4';
import type { LandingHeaderProps } from 'src/components/LandingHeader';
import type { DestinationFormType } from 'src/features/Delivery/Shared/types';

export const DestinationCreate = () => {
  const { mutateAsync: createDestination, isPending: isCreatingDestination } =
    useCreateDestinationMutation();
  const navigate = useNavigate();

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/logs/delivery/destinations/create',
      crumbOverrides: [
        {
          label: 'Delivery',
          linkTo: '/logs/delivery/destinations',
          position: 1,
        },
      ],
    },
    removeCrumbX: [1, 2],
    title: 'Create Destination',
  };

  const form = useForm<DestinationFormType>({
    defaultValues: {
      type: destinationType.AkamaiObjectStorage,
      details: {
        path: '',
      },
    },
    mode: 'onBlur',
    resolver: yupResolver(destinationFormSchema),
  });

  const onSubmit = () => {
    const formValues = form.getValues();
    const destination: CreateDestinationPayload = {
      ...formValues,
      details: getDestinationPayloadDetails(formValues.details),
    };

    createDestination(destination)
      .then(() => {
        navigate({ to: '/logs/delivery/destinations' });
        return enqueueSnackbar(
          `Destination  ${destination.label} created successfully`,
          {
            variant: 'success',
          }
        );
      })
      .catch((errors) => {
        for (const error of errors) {
          if (error.field) {
            form.setError(error.field, { message: error.reason });
          } else {
            form.setError('root', { message: error.reason });
          }
        }

        return enqueueSnackbar('There was an issue creating your destination', {
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
