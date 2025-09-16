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
import { StreamForm } from 'src/features/DataStream/Streams/StreamForm/StreamForm';

import type { StreamAndDestinationFormType } from 'src/features/DataStream/Streams/StreamForm/types';

export const StreamEdit = () => {
  const { streamId } = useParams({
    from: '/datastream/streams/$streamId/edit',
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
      pathname: '/datastream/streams/edit',
      crumbOverrides: [
        {
          label: 'DataStream',
          linkTo: '/datastream/streams',
          position: 1,
        },
      ],
    },
    removeCrumbX: 2,
    title: `Edit Stream ${streamId}`,
  };

  const form = useForm<StreamAndDestinationFormType>({
    defaultValues: {
      stream: {
        type: streamType.AuditLogs,
        details: {},
      },
      destination: {
        type: destinationType.LinodeObjectStorage,
        details: {
          region: '',
        },
      },
    },
    mode: 'onBlur',
    resolver: yupResolver(streamAndDestinationFormSchema),
  });

  useEffect(() => {
    if (stream) {
      const details =
        Object.keys(stream.details).length > 0
          ? {
              is_auto_add_all_clusters_enabled: false,
              cluster_ids: [],
              ...stream.details,
            }
          : {};

      const streamsDestinationIds = stream.destinations.map(({ id }) => id);
      form.reset({
        stream: {
          ...stream,
          details,
          destinations: streamsDestinationIds,
        },
        destination: destinations?.data?.find(
          ({ id }) => id === streamsDestinationIds[0]
        ),
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
