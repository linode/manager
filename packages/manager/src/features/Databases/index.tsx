import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';

const DatabaseLanding = React.lazy(() => import('./DatabaseLanding'));
const DatabaseDetail = React.lazy(() => import('./DatabaseDetail'));

type Props = RouteComponentProps<{}>;

type CombinedProps = Props;

const Database: React.FC<CombinedProps> = props => {
  const {
    match: { path }
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="Databases" />
        <Switch>
          <Route component={DatabaseLanding} path={path} exact />
          <Route component={DatabaseDetail} path={`${path}/:id`} exact strict />
          <Route
            component={DatabaseDetail}
            path={`${path}/:id/backups`}
            exact
            strict
          />
          <Route
            component={DatabaseDetail}
            path={`${path}/:id/settings`}
            exact
            strict
          />
          <Redirect to={path} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default Database;
