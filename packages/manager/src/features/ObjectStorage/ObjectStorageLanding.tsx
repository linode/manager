import * as React from 'react';
import { connect } from 'react-redux';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
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
import useObjectStorageBuckets from 'src/hooks/useObjectStorageBuckets';
import useObjectStorageClusters from 'src/hooks/useObjectStorageClusters';
import { MapState } from 'src/store/types';
import BucketDrawer from './BucketLanding/BucketDrawer';
import useReduxLoad from 'src/hooks/useReduxLoad';

const BucketLanding = React.lazy(() => import('./BucketLanding/BucketLanding'));
const AccessKeyLanding = React.lazy(() =>
  import('./AccessKeyLanding/AccessKeyLanding')
);

const useStyles = makeStyles((theme: Theme) => ({
  promo: {
    marginBottom: theme.spacing() / 2
  }
}));

type CombinedProps = StateProps & RouteComponentProps<{}>;

export const ObjectStorageLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  useReduxLoad(['clusters']);

  const { objectStorageClusters } = useObjectStorageClusters();
  const {
    objectStorageBuckets,
    requestObjectStorageBuckets
  } = useObjectStorageBuckets();

  const tabs = [
    /* NB: These must correspond to the routes, inside the Switch */
    {
      title: 'Buckets',
      routeName: `${props.match.url}/buckets`
    },
    {
      title: 'Access Keys',
      routeName: `${props.match.url}/access-keys`
    }
  ];

  const { isRestrictedUser } = props;

  const clustersLoaded = objectStorageClusters.lastUpdated > 0;

  const bucketsLoadingOrLoaded =
    objectStorageBuckets.loading ||
    objectStorageBuckets.lastUpdated > 0 ||
    objectStorageBuckets.bucketErrors;

  React.useEffect(() => {
    // Object Storage is not available for restricted users.
    if (isRestrictedUser) {
      return;
    }

    // Once the OBJ Clusters have been loaded, request Buckets from each Cluster.
    if (clustersLoaded && !bucketsLoadingOrLoaded) {
      const clusterIds = objectStorageClusters.entities.map(
        thisCluster => thisCluster.id
      );

      requestObjectStorageBuckets(clusterIds).catch(() => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }
  }, [
    isRestrictedUser,
    clustersLoaded,
    bucketsLoadingOrLoaded,
    objectStorageClusters,
    requestObjectStorageBuckets
  ]);

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
  isRestrictedUser: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  isRestrictedUser: state.__resources.profile.data?.restricted ?? true
});

export const connected = connect(mapStateToProps);

const enhanced = compose(connected, React.memo);

export default enhanced(ObjectStorageLanding);
