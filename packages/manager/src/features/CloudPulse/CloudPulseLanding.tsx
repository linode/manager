import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { CloudPulseTabs } from './CloudPulseTabs';
export const CloudPulseLanding = () => {
  return (
    <>
      <LandingHeader
        breadcrumbProps={{ pathname: '/Akamai Cloud Pulse' }}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/"
      />
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route component={CloudPulseTabs} />
        </Switch>
      </React.Suspense>
    </>
  );
};

export const cloudPulseLandingLazyRoute = createLazyRoute(
  '/monitor/cloudpulse'
)({
  component: CloudPulseLanding,
});
