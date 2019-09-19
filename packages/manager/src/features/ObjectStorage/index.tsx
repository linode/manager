import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';

const ObjectStorageLanding = DefaultLoader({
  loader: () => import('./ObjectStorageLanding')
});

const BucketDetail = DefaultLoader({
  loader: () => import('./BucketDetail/BucketDetail')
});

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
