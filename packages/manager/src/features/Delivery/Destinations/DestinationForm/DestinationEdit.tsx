import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType } from '@linode/api-v4';
import {
  useDestinationQuery,
  useUpdateDestinationMutation,
} from '@linode/queries';
import { Box, CircleProgress, ErrorState, omitProps } from '@linode/ui';
import { destinationFormSchema } from '@linode/validation';
import { useNavigate, useParams } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { getDestinationPayloadDetails } from 'src/features/Delivery/deliveryUtils';
import { DestinationForm } from 'src/features/Delivery/Destinations/DestinationForm/DestinationForm';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { UpdateDestinationPayloadWithId } from '@linode/api-v4';
import type { LandingHeaderProps } from 'src/components/LandingHeader';
import type { DestinationFormType } from 'src/features/Delivery/Shared/types';

export const DestinationEdit = () => {
  const navigate = useNavigate();
  const { destinationId } = useParams({
    from: '/logs/delivery/destinations/$destinationId/edit',
  });
  const { mutateAsync: updateDestination, isPending: isUpdatingDestination } =
    useUpdateDestinationMutation();
  const {
    data: destination,
    isLoading,
    error,
  } = useDestinationQuery(Number(destinationId));

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/logs/delivery/destinations/edit',
      crumbOverrides: [
        {
          label: 'Delivery',
          linkTo: '/logs/delivery/destinations',
          position: 1,
        },
      ],
    },
    removeCrumbX: [1, 2],
    title: `Edit Destination ${destinationId}`,
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

  useEffect(() => {
    if (destination) {
      form.reset({
        ...destination,
        ...('path' in destination.details
          ? {
              details: {
                ...destination.details,
                path: destination.details.path || '',
              },
            }
          : {}),
      });
    }
  }, [destination, form]);

  const onSubmit = () => {
    const formValues = form.getValues();
    const destination: UpdateDestinationPayloadWithId = {
      id: destinationId,
      ...omitProps(formValues, ['type']),
      details: getDestinationPayloadDetails(formValues.details),
    };

    updateDestination(destination)
      .then(() => {
        navigate({ to: '/logs/delivery/destinations' });
        return enqueueSnackbar(
          `Destination  ${destination.label} edited successfully`,
          {
            variant: 'success',
          }
        );
      })
      .catch((error) => {
        return enqueueSnackbar(
          getAPIErrorOrDefault(
            error,
            `There was an issue editing your destination`
          )[0].reason,
          {
            variant: 'error',
          }
        );
      });
  };

  return (
    <>
      <DocumentTitleSegment segment="Edit Destination" />
      <LandingHeader {...landingHeaderProps} />
      {isLoading && (
        <Box display="flex" justifyContent="center">
          <CircleProgress size="md" />
        </Box>
      )}
      {error && (
        <ErrorState
          compact
          errorText="There was an error retrieving destination. Please reload and try again."
        />
      )}
      {!isLoading && !error && (
        <FormProvider {...form}>
          <DestinationForm
            isSubmitting={isUpdatingDestination}
            mode="edit"
            onSubmit={onSubmit}
          />
        </FormProvider>
      )}
    </>
  );
};
