import {
  ObjectStorageBucket,
  ObjectStorageCluster
} from 'linode-js-sdk/lib/object-storage';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import Breadcrumb from 'src/components/Breadcrumb';

import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import PromotionalOfferCard from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useFlags from 'src/hooks/useFlags';
import { ApplicationState } from 'src/store';
import { getAllBucketsFromAllClusters } from 'src/store/bucket/bucket.requests';
import { BucketError } from 'src/store/bucket/types';
import { requestClusters as _requestClusters } from 'src/store/clusters/clusters.actions';
import { MapState } from 'src/store/types';
import BucketDrawer from './BucketLanding/BucketDrawer';

const BucketLanding = React.lazy(() => import('./BucketLanding/BucketLanding'));
const AccessKeyLanding = React.lazy(() =>
  import('./AccessKeyLanding/AccessKeyLanding')
);

const useStyles = makeStyles((theme: Theme) => ({
  promo: {
    marginBottom: theme.spacing() / 2
  }
}));

type CombinedProps = StateProps & DispatchProps & RouteComponentProps<{}>;

export const ObjectStorageLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Buckets',
      routeName: `${props.match.url}/buckets`
    },
    {
      title: 'Access Keys',
      routeName: `${props.match.url}/access-keys`
    }
  ];

  React.useEffect(() => {
    const {
      bucketsLastUpdated,
      bucketErrors,
      clustersLastUpdated,
      isRestrictedUser,
      requestAllBucketsFromAllClusters,
      requestClusters
    } = props;

    // Object Storage is not available for restricted users, so we avoid these
    // requests if the user is restricted.
    if (isRestrictedUser) {
      return;
    }

    // Request buckets if we haven't already, or if there are errors.
    // @todo: use useReduxLoad for this.
    if (bucketsLastUpdated === 0 || bucketErrors.length > 0) {
      requestAllBucketsFromAllClusters().catch(err => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }

    // Request clusters if we haven't already
    if (clustersLastUpdated === 0) {
      requestClusters().catch(err => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }
  }, [props.isRestrictedUser]);

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const flags = useFlags();

  const objPromotionalOffers = (
    flags.promotionalOffers ?? []
  ).filter(promotionalOffer =>
    promotionalOffer.features.includes('Object Storage')
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          labelTitle="Object Storage"
          removeCrumbX={1}
        />
        <DocumentationButton href="https://www.linode.com/docs/platform/object-storage/" />
      </Box>
      <Tabs defaultIndex={tabs.findIndex(tab => matches(tab.routeName))}>
        <TabLinkList tabs={tabs} />

        {objPromotionalOffers.map(promotionalOffer => (
          <PromotionalOfferCard
            key={promotionalOffer.name}
            {...promotionalOffer}
            fullWidth
            className={classes.promo}
          />
        ))}
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <TabPanel>
              <BucketLanding isRestrictedUser={props.isRestrictedUser} />
            </TabPanel>
            <TabPanel>
              <AccessKeyLanding isRestrictedUser={props.isRestrictedUser} />
            </TabPanel>
          </TabPanels>
        </React.Suspense>
        <BucketDrawer isRestrictedUser={props.isRestrictedUser} />
      </Tabs>
    </React.Fragment>
  );
};

interface StateProps {
  bucketsLastUpdated: number;
  clustersLastUpdated: number;
  isRestrictedUser: boolean;
  bucketErrors: BucketError[];
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  bucketsLastUpdated: state.__resources.buckets.lastUpdated,
  bucketErrors: state.__resources.buckets.bucketErrors ?? [],
  clustersLastUpdated: state.__resources.clusters.lastUpdated,
  isRestrictedUser: pathOr(
    true,
    ['__resources', 'profile', 'data', 'restricted'],
    state
  )
});

interface DispatchProps {
  requestAllBucketsFromAllClusters: () => Promise<ObjectStorageBucket[]>;
  requestClusters: () => Promise<ObjectStorageCluster[]>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    requestAllBucketsFromAllClusters: () =>
      dispatch(getAllBucketsFromAllClusters()),
    requestClusters: () => dispatch(_requestClusters())
  };
};

export const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(connected);
export default enhanced(ObjectStorageLanding);
