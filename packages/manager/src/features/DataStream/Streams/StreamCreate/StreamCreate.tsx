import { Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';

import { useStyles } from './StreamCreate.styles';
import { StreamCreateCheckoutBar } from './StreamCreateCheckoutBar';
import { StreamCreateDataSet } from './StreamCreateDataSet';
import { StreamCreateDelivery } from './StreamCreateDelivery';
import { StreamCreateGeneralInfo } from './StreamCreateGeneralInfo';
import { type CreateStreamForm, EventType, StreamType } from './types';

export const StreamCreate = () => {
  const { classes } = useStyles();
  const form = useForm<CreateStreamForm>({
    defaultValues: {
      type: StreamType.AuditLogs,
      [EventType.Authorization]: false,
      [EventType.Authentication]: false,
      [EventType.Configuration]: false,
    },
  });

  const { handleSubmit } = form;

  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/datastream/streams/create',
      crumbOverrides: [
        {
          label: 'DataStream',
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
          <Grid className={classes.root} container>
            <Grid className="mlMain">
              <Stack spacing={2}>
                <StreamCreateGeneralInfo />
                <StreamCreateDataSet />
                <StreamCreateDelivery />
              </Stack>
            </Grid>
            <Grid className="mlSidebar">
              <StreamCreateCheckoutBar />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </>
  );
};
