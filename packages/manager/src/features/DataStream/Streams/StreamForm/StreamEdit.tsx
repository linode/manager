import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType, streamType } from '@linode/api-v4';
import { useStreamQuery, useUpdateStreamMutation } from '@linode/queries';
import { Box, CircleProgress, ErrorState } from '@linode/ui';
import { streamAndDestinationFormSchema } from '@linode/validation';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  LandingHeader,
  type LandingHeaderProps,
} from 'src/components/LandingHeader';
import { getStreamPayloadDetails } from 'src/features/DataStream/dataStreamUtils';
import { StreamForm } from 'src/features/DataStream/Streams/StreamForm/StreamForm';

import type { UpdateStreamPayloadWithId } from '@linode/api-v4';
import type { StreamAndDestinationFormType } from 'src/features/DataStream/Streams/StreamForm/types';

export const StreamEdit = () => {
  const navigate = useNavigate();
  const { streamId } = useParams({
    from: '/datastream/streams/$streamId/edit',
  });
  const { mutateAsync: updateStream } = useUpdateStreamMutation();
  const { data: stream, isLoading, error } = useStreamQuery(Number(streamId));

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

      form.reset({
        stream: {
          ...stream,
          details,
          destinations: stream.destinations.map(({ id }) => id),
        },
        destination: stream.destinations?.[0],
      });
    }
  }, [stream, form]);

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
    title: 'Edit Stream',
  };

  const onSubmit = () => {
    const {
      stream: { label, type, destinations, details },
    } = form.getValues();

    // TODO: DPS-33120 create destination call if new destination created

    const payload: UpdateStreamPayloadWithId = {
      id: stream!.id,
      label,
      type: stream!.type,
      status: stream!.status,
      destinations: destinations as number[], // TODO: remove type assertion after DPS-33120
      details: getStreamPayloadDetails(type, details),
    };

    updateStream(payload).then(() => {
      navigate({ to: '/datastream/streams' });
    });
  };

  return (
    <>
      <DocumentTitleSegment segment="Edit Stream" />
      <LandingHeader {...landingHeaderProps} />
      {isLoading && (
        <Box display="flex" justifyContent="center">
          <CircleProgress size="md" />
        </Box>
      )}
      {error && (
        <ErrorState
          compact
          errorText="There was an error retrieving stream. Please reload and try again."
        />
      )}
      {!isLoading && !error && (
        <FormProvider {...form}>
          <StreamForm
            mode="edit"
            onSubmit={onSubmit}
            streamId={`${streamId}`}
          />
        </FormProvider>
      )}
    </>
  );
};
