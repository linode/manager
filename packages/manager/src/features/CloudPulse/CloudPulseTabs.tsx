import { Paper } from '@mui/material';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';

type Props = RouteComponentProps<{}>;

export const CloudPulseTabs = React.memo((props: Props) => {
  return (
    <>
      <LandingHeader removeCrumbX={1} title="Cloud Pulse" />
      <Paper></Paper>
    </>
  );
});
