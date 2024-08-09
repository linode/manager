import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import type { RouteComponentProps } from 'react-router-dom';

const ObjectStorageLanding = React.lazy(() =>
  import('./ObjectStorageLanding').then((module) => ({
    default: module.ObjectStorageLanding,
  }))
);

const BucketDetail = React.lazy(() => import('./BucketDetail'));

type CombinedProps = RouteComponentProps;

export const ObjectStorage: React.FC<CombinedProps> = (props) => {
  const path = props.match.path;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Object Storage" />
      <Switch>
        <Route
          component={BucketDetail}
          path={`${path}/buckets/:clusterId/:bucketName`}
        />
        <Route
          component={ObjectStorageLanding}
          path={`${path}/:tab?/:action?`}
        />
      </Switch>
    </React.Suspense>
  );
};

export default ObjectStorage;
