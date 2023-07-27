import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';

import SuspenseLoader from 'src/components/SuspenseLoader';

const ManagedLanding = React.lazy(() => import('./ManagedLanding'));

type ManagedProps = RouteComponentProps<{}>;

const Managed = (props: ManagedProps) => {
  const {
    match: { path },
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={ManagedLanding} path={path} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(Managed);
