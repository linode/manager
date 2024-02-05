import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { CloudViewTabs } from './CloudViewTabs';

export const CloudViewLanding = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={CloudViewTabs} />
      </Switch>
    </React.Suspense>
  );
};
