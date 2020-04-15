import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

const ObjectStorageLanding = React.lazy(() => import('./ObjectStorageLanding'));
const BucketDetail = React.lazy(() => import('./BucketDetail/BucketDetail'));

type CombinedProps = RouteComponentProps;

export const ObjectStorage: React.FC<CombinedProps> = props => {
  const path = props.match.path;

  return (
    <Switch>
      <Route
        path={`${path}/buckets/:clusterId/:bucketName`}
        component={BucketDetail}
      />
      <Route component={ObjectStorageLanding} path={path} />
    </Switch>
  );
};

export default ObjectStorage;
