import { Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { destinationType } from 'src/features/DataStream/Shared/types';

import { StreamCreateCheckoutBar } from './StreamCreateCheckoutBar';
import { StreamCreateDataSet } from './StreamCreateDataSet';
import { StreamCreateDelivery } from './StreamCreateDelivery';
import { StreamCreateGeneralInfo } from './StreamCreateGeneralInfo';
import { type CreateStreamForm, eventType, streamType } from './types';

export const StreamCreate = () => {
  const form = useForm<CreateStreamForm>({
    defaultValues: {
      type: streamType.AuditLogs,
      [eventType.Authorization]: false,
      [eventType.Authentication]: false,
      [eventType.Configuration]: false,
      destination_type: destinationType.LinodeObjectStorage,
      region: '',
    },
  });

  const { handleSubmit } = form;

  const landingHeaderProps = {
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

  const onSubmit = () => {};

  return (
    <>
      <DocumentTitleSegment segment="Create Stream" />
      <LandingHeader {...landingHeaderProps} />
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
              <Stack spacing={2}>
                <StreamCreateGeneralInfo />
                <StreamCreateDataSet />
                <StreamCreateDelivery />
              </Stack>
            </Grid>
            <Grid size={{ lg: 3, md: 12, sm: 12, xs: 12 }}>
              <StreamCreateCheckoutBar />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </>
  );
};
