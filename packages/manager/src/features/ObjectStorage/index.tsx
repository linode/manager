import * as React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const ObjectStorageLanding = React.lazy(() => import('./ObjectStorageLanding'));
const BucketDetail = React.lazy(() => import('./BucketDetail'));

export const ObjectStorage: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route
          component={BucketDetail}
          path={`${path}/buckets/:clusterId/:bucketName`}
        />
        <Route component={ObjectStorageLanding} path={path} exact strict />
        <Redirect to={path} />
      </Switch>
    </React.Suspense>
  );
};

export default ObjectStorage;
