import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType, streamType } from '@linode/api-v4';
import { useAllDestinationsQuery, useStreamQuery } from '@linode/queries';
import { Box, CircleProgress, ErrorState } from '@linode/ui';
import { streamAndDestinationFormSchema } from '@linode/validation';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  LandingHeader,
  type LandingHeaderProps,
} from 'src/components/LandingHeader';
import { StreamForm } from 'src/features/Delivery/Streams/StreamForm/StreamForm';

import type { StreamAndDestinationFormType } from 'src/features/Delivery/Streams/StreamForm/types';

export const StreamEdit = () => {
  const { streamId } = useParams({
    from: '/logs/delivery/streams/$streamId/edit',
  });
  const {
    data: destinations,
    isLoading: isLoadingDestinations,
    error: errorDestinations,
  } = useAllDestinationsQuery();
  const {
    data: stream,
    isLoading: isLoadingStream,
    error: errorStream,
  } = useStreamQuery(Number(streamId));

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/logs/delivery/streams/edit',
      crumbOverrides: [
        {
          label: 'Delivery',
          linkTo: '/logs/delivery/streams',
          position: 1,
        },
      ],
    },
    removeCrumbX: [1, 2],
    title: `Edit Stream ${streamId}`,
  };

  const form = useForm<StreamAndDestinationFormType>({
    defaultValues: {
      stream: {
        type: streamType.AuditLogs,
        details: null,
        destinations: [],
      },
      destination: {
        type: destinationType.AkamaiObjectStorage,
        details: {
          path: '',
        },
      },
    },
    mode: 'onBlur',
    resolver: yupResolver(streamAndDestinationFormSchema),
  });

  useEffect(() => {
    if (stream && destinations) {
      const details = stream.details
        ? {
            is_auto_add_all_clusters_enabled: false,
            cluster_ids: [],
            ...stream.details,
          }
        : null;

      const streamsDestinationIds = stream.destinations.map(({ id }) => id);
      const destination = destinations?.find(
        ({ id }) => id === streamsDestinationIds[0]
      );

      form.reset({
        stream: {
          ...stream,
          details,
          destinations: streamsDestinationIds,
        },
        destination: destination
          ? {
              ...destination,
              ...('path' in destination.details
                ? {
                    details: {
                      ...destination.details,
                      path: destination.details.path || '',
                    },
                  }
                : {}),
            }
          : undefined,
      });
    }
  }, [stream, destinations, form]);

  return (
    <>
      <DocumentTitleSegment segment="Edit Stream" />
      <LandingHeader {...landingHeaderProps} />
      {(isLoadingStream || isLoadingDestinations) && (
        <Box display="flex" justifyContent="center">
          <CircleProgress size="md" />
        </Box>
      )}
      {errorStream && (
        <ErrorState
          compact
          errorText="There was an error retrieving stream. Please reload and try again."
        />
      )}
      {errorDestinations && (
        <ErrorState
          compact
          errorText="There was an error retrieving destinations. Please reload and try again."
        />
      )}
      {!isLoadingStream &&
        !isLoadingDestinations &&
        !errorStream &&
        !errorDestinations && (
          <FormProvider {...form}>
            <StreamForm mode="edit" streamId={streamId} />
          </FormProvider>
        )}
    </>
  );
};
