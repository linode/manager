import { Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { StreamCreateCheckoutBar } from 'src/features/DataStream/Streams/StreamCreate/StreamCreateCheckoutBar';
import { StreamCreateDataSet } from 'src/features/DataStream/Streams/StreamCreate/StreamCreateDataSet';
import { StreamCreateDelivery } from 'src/features/DataStream/Streams/StreamCreate/StreamCreateDelivery';
import { StreamCreateGeneralInfo } from 'src/features/DataStream/Streams/StreamCreate/StreamCreateGeneralInfo';

import { useStyles } from './StreamCreate.styles';

export const StreamCreate = () => {
  const { classes } = useStyles();

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

  return (
    <Grid className={classes.root} container>
      <DocumentTitleSegment segment="Create Stream" />
      <LandingHeader {...landingHeaderProps} />

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
  );
};
