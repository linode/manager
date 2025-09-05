import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType, streamType } from '@linode/api-v4';
import { useCreateStreamMutation } from '@linode/queries';
import { streamAndDestinationFormSchema } from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  LandingHeader,
  type LandingHeaderProps,
} from 'src/components/LandingHeader';
import { getStreamPayloadDetails } from 'src/features/DataStream/dataStreamUtils';
import { StreamForm } from 'src/features/DataStream/Streams/StreamForm/StreamForm';
import { sendCreateStreamEvent } from 'src/utilities/analytics/customEventAnalytics';

import type { CreateStreamPayload } from '@linode/api-v4';
import type {
  StreamAndDestinationFormType,
  StreamFormType,
} from 'src/features/DataStream/Streams/StreamForm/types';

export const StreamCreate = () => {
  const { mutateAsync: createStream } = useCreateStreamMutation();
  const navigate = useNavigate();

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

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/datastream/streams/create',
      crumbOverrides: [
        {
          label: 'DataStream',
          linkTo: '/datastream/streams',
          position: 1,
        },
      ],
    },
    removeCrumbX: 2,
    title: 'Create Stream',
  };

  const onSubmit = () => {
    const {
      stream: { label, type, destinations, details },
    } = form.getValues();
    const payload: StreamFormType = {
      label,
      type,
      destinations,
      details: getStreamPayloadDetails(type, details),
    };

    createStream(payload as CreateStreamPayload).then(() => {
      sendCreateStreamEvent('Stream Create Page');
      navigate({ to: '/datastream/streams' });
    });
  };

  return (
    <>
      <DocumentTitleSegment segment="Create Stream" />
      <LandingHeader {...landingHeaderProps} />
      <FormProvider {...form}>
        <StreamForm mode="create" onSubmit={onSubmit} />
      </FormProvider>
    </>
  );
};
