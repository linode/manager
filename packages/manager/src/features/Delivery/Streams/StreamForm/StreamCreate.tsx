import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType, streamType } from '@linode/api-v4';
import { streamAndDestinationFormSchema } from '@linode/validation';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  LandingHeader,
  type LandingHeaderProps,
} from 'src/components/LandingHeader';
import { StreamForm } from 'src/features/Delivery/Streams/StreamForm/StreamForm';

import type { StreamAndDestinationFormType } from 'src/features/Delivery/Streams/StreamForm/types';

export const StreamCreate = () => {
  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/logs/delivery/streams/create',
      crumbOverrides: [
        {
          label: 'Delivery',
          linkTo: '/logs/delivery/streams',
          position: 1,
        },
      ],
    },
    removeCrumbX: [1, 2],
    title: 'Create Stream',
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
          path: '',
        },
      },
    },
    mode: 'onBlur',
    resolver: yupResolver(streamAndDestinationFormSchema),
  });

  return (
    <>
      <DocumentTitleSegment segment="Create Stream" />
      <LandingHeader {...landingHeaderProps} />
      <FormProvider {...form}>
        <StreamForm mode="create" />
      </FormProvider>
    </>
  );
};
