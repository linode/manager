import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import Notice from 'src/components/Notice';
import PromotionalOfferCard from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import useObjectStorageBuckets from 'src/hooks/useObjectStorageBuckets';
import useObjectStorageClusters from 'src/hooks/useObjectStorageClusters';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { openBucketDrawer } from 'src/store/bucketDrawer/bucketDrawer.actions';
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

type CombinedProps = RouteComponentProps<{}>;

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

  const { _isRestrictedUser, accountSettings } = useAccountManagement();

  const clustersLoaded = objectStorageClusters.lastUpdated > 0;

  const bucketsLoadingOrLoaded =
    objectStorageBuckets.loading ||
    objectStorageBuckets.lastUpdated > 0 ||
    objectStorageBuckets.bucketErrors;

  React.useEffect(() => {
    // Object Storage is not available for restricted users.
    if (_isRestrictedUser) {
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
    _isRestrictedUser,
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

  // A user needs to explicitly cancel Object Storage in their Account Settings in order to stop
  // being billed. If they have the service enabled but do not have any buckets, show a warning.
  const shouldDisplayBillingNotice =
    objectStorageBuckets.lastUpdated > 0 &&
    !objectStorageBuckets.bucketErrors &&
    objectStorageBuckets.data.length === 0 &&
    accountSettings.data?.object_storage === 'active';

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          labelTitle="Object Storage"
          removeCrumbX={1}
        />
        {!flags.cmr && (
          <DocumentationButton href="https://www.linode.com/docs/platform/object-storage/" />
        )}
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
        {shouldDisplayBillingNotice && <BillingNotice />}
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <BucketLanding isRestrictedUser={_isRestrictedUser} />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <AccessKeyLanding isRestrictedUser={_isRestrictedUser} />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
        <BucketDrawer isRestrictedUser={_isRestrictedUser} />
      </Tabs>
    </React.Fragment>
  );
};

export default React.memo(ObjectStorageLanding);

// =============================================================================
// <BillingNotice/>
// ============================================================================
const useBillingNoticeStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles
  }
}));

export const BillingNotice: React.FC<{}> = React.memo(() => {
  const classes = useBillingNoticeStyles();

  const dispatch: Dispatch = useDispatch();

  const openDrawer = () => dispatch(openBucketDrawer());

  return (
    <Notice warning important>
      You are being billed for Object Storage but do not have any Buckets. You
      can cancel Object Storage in your{' '}
      <Link to="/account/settings">Account Settings</Link>, or{' '}
      <button className={classes.button} onClick={openDrawer}>
        create a Bucket.
      </button>
    </Notice>
  );
});
