import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { CloudPulseTabs } from './CloudPulseTabs';

export const CloudPulseLanding = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={CloudPulseTabs} />
      </Switch>
    </React.Suspense>
  );
};
