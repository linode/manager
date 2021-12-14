import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useFlags from 'src/hooks/useFlags';
import useReduxLoad from 'src/hooks/useReduxLoad';

const DatabaseLanding = React.lazy(() => import('./DatabaseLanding'));
const DatabaseDetail = React.lazy(() => import('./DatabaseDetail'));
const DatabaseCreate = React.lazy(() => import('./DatabaseCreate'));

type Props = RouteComponentProps<{}>;

type CombinedProps = Props;

const Database: React.FC<CombinedProps> = (props) => {
  const {
    match: { path },
  } = props;

  useReduxLoad(['databases']);

  // @TODO: Remove when Database goes to GA
  const flags = useFlags();
  if (!flags.databases) {
    return null;
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Databases" />
      <Switch>
        <Route component={DatabaseCreate} path={`${path}/create`} exact />
        <Route component={DatabaseDetail} path={`${path}/:id`} exact strict />
        <Route component={DatabaseLanding} exact />
      </Switch>
    </React.Suspense>
  );
};

export default Database;
