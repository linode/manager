import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { CloudViewTabs } from './CloudViewTabs';

const CloudViewLanding = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={CloudViewTabs} />
      </Switch>
    </React.Suspense>
  );
};

export default CloudViewLanding;
