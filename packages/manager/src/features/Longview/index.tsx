import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const LongviewLanding = React.lazy(() => import('./LongviewLanding'));
const LongviewDetail = React.lazy(() => import('./LongviewDetail'));

const Longview: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={LongviewDetail} path={`${path}/clients/:id`} />
        <Route component={LongviewLanding} />
      </Switch>
    </React.Suspense>
  );
};

export default Longview;
