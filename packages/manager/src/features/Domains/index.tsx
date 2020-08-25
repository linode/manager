import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';

import SuspenseLoader from 'src/components/SuspenseLoader';

const DomainsLanding = React.lazy(() => import('./DomainsLanding'));
const DomainDetail = React.lazy(() => import('./DomainDetail'));

type CombinedProps = RouteComponentProps<{ domainId?: string }>;

const DomainsRoutes: React.FC<CombinedProps> = props => {
  const {
    match: { path }
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route
          path={`${path}/:domainId/records`}
          exact
          strict
          component={DomainDetail}
        />
        <Route
          path={`${path}/:domainId`}
          exact
          strict
          component={DomainDetail}
        />
        <Route component={DomainsLanding} path={path} exact strict />
        <Redirect to={`${path}`} />
      </Switch>
    </React.Suspense>
  );
};

const enhanced = compose<CombinedProps, {}>(withRouter);

export default enhanced(DomainsRoutes);
