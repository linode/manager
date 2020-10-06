import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const ObjectStorageLanding = React.lazy(() => import('./ObjectStorageLanding'));
const BucketDetail = React.lazy(() => import('./BucketDetail'));

type CombinedProps = RouteComponentProps;

export const ObjectStorage: React.FC<CombinedProps> = props => {
  const path = props.match.path;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route
          path={`${path}/buckets/:clusterId/:bucketName`}
          component={BucketDetail}
        />
        <Route component={ObjectStorageLanding} path={path} />
      </Switch>
    </React.Suspense>
  );
};

export default ObjectStorage;
