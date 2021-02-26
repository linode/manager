import * as React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useReduxLoad from 'src/hooks/useReduxLoad';

const DatabaseLanding = React.lazy(() => import('./DatabaseLanding'));
const DatabaseDetail = React.lazy(() => import('./DatabaseDetail'));

type Props = RouteComponentProps<{}>;

type CombinedProps = Props;

const Database: React.FC<CombinedProps> = props => {
  const {
    match: { path },
  } = props;

  useReduxLoad(['databases']);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Databases" />
      <Route component={DatabaseLanding} exact path={path} />
      <Route component={DatabaseDetail} path={`${path}/:id`} />
    </React.Suspense>
  );
};

export default Database;
