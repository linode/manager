import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import DefaultLoader from 'src/components/DefaultLoader';
import { ApplicationState } from 'src/store';
import { getAllBuckets } from 'src/store/bucket/bucket.requests';
import { requestClusters as _requestClusters } from 'src/store/clusters/clusters.actions';
import { MapState } from 'src/store/types';

const ObjectStorageLanding = DefaultLoader({
  loader: () => import('./ObjectStorageLanding')
});

const BucketDetail = DefaultLoader({
  loader: () => import('./BucketDetail/BucketDetail')
});

type CombinedProps = RouteComponentProps & StateProps & DispatchProps;

export const ObjectStorage: React.FC<CombinedProps> = props => {
  React.useEffect(() => {
    const {
      bucketsLastUpdated,
      clustersLastUpdated,
      requestBuckets,
      requestClusters
    } = props;

    /**
     * @todo: Move these requests to App.tsx like other entities when OBJ is generally available.
     */

    // Request buckets if we haven't already
    if (bucketsLastUpdated === 0) {
      requestBuckets().catch(err => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }

    // Request clusters if we haven't already
    if (clustersLastUpdated === 0) {
      requestClusters().catch(err => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }
  }, []);

  const path = props.match.path;

  return (
    <>
      <Switch>
        <Route
          path={`${path}/buckets/:clusterId/:bucketName`}
          component={BucketDetail}
        />
        <Route component={ObjectStorageLanding} path={path} />
      </Switch>
    </>
  );
};

interface StateProps {
  bucketsLastUpdated: number;
  clustersLastUpdated: number;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  bucketsLastUpdated: state.__resources.buckets.lastUpdated,
  clustersLastUpdated: state.__resources.clusters.lastUpdated
});

interface DispatchProps {
  requestBuckets: () => Promise<Linode.Bucket[]>;
  requestClusters: () => Promise<Linode.Cluster[]>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    requestBuckets: () => dispatch(getAllBuckets()),
    requestClusters: () => dispatch(_requestClusters())
  };
};

export const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, {}>(connected);
export default enhanced(ObjectStorage);
