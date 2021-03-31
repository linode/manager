import { DateTime } from 'luxon';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
  matchPath,
  RouteComponentProps,
  useRouteMatch,
} from 'react-router-dom';
import { compose } from 'recompose';
import { Dispatch } from 'redux';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import Notice from 'src/components/Notice';
import Typography from 'src/components/core/Typography';
import PromotionalOfferCard from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import bucketDrawerContainer, {
  DispatchProps,
} from 'src/containers/bucketDrawer.container';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import useFlags from 'src/hooks/useFlags';
import useObjectStorageBuckets from 'src/hooks/useObjectStorageBuckets';
import useObjectStorageClusters from 'src/hooks/useObjectStorageClusters';
import useOpenClose from 'src/hooks/useOpenClose';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { openBucketDrawer } from 'src/store/bucketDrawer/bucketDrawer.actions';
import { MODE } from './AccessKeyLanding/types';
import BucketDrawer from './BucketLanding/BucketDrawer';

const BucketLanding = React.lazy(() => import('./BucketLanding/BucketLanding'));
const AccessKeyLanding = React.lazy(
  () => import('./AccessKeyLanding/AccessKeyLanding')
);

const useStyles = makeStyles((theme: Theme) => ({
  promo: {
    marginBottom: theme.spacing() / 2,
  },
}));

type CombinedProps = DispatchProps & RouteComponentProps<{}>;

export const ObjectStorageLanding: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { replace } = props.history;
  const [mode, setMode] = React.useState<MODE>('creating');

  useReduxLoad(['clusters']);

  const dispatch = useDispatch<Dispatch>();

  // @todo: dispatch bucket drawer open action

  // On-the-fly route matching so this component can open the drawer itself.
  const createBucketRouteMatch = Boolean(
    useRouteMatch('/object-storage/buckets/create')
  );

  React.useEffect(() => {
    if (createBucketRouteMatch) {
      dispatch(openBucketDrawer());
    }
  }, [dispatch, createBucketRouteMatch]);

  const { objectStorageClusters } = useObjectStorageClusters();
  const {
    objectStorageBuckets,
    requestObjectStorageBuckets,
  } = useObjectStorageBuckets();

  const createOrEditDrawer = useOpenClose();

  const [route, setRoute] = React.useState<string>('');

  const tabs = [
    /* NB: These must correspond to the routes, inside the Switch */
    {
      title: 'Buckets',
      routeName: `${props.match.url}/buckets`,
    },
    {
      title: 'Access Keys',
      routeName: `${props.match.url}/access-keys`,
    },
  ];

  const openDrawer = (mode: MODE) => {
    setMode(mode);
    createOrEditDrawer.open();
  };

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
        (thisCluster) => thisCluster.id
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
    requestObjectStorageBuckets,
  ]);

  React.useEffect(() => {
    setRoute(props.location.pathname.replace('/object-storage/', ''));
  }, [route, props.location.pathname]);

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    setRoute(props.location.pathname.replace('/object-storage/', ''));
    props.history.push(tabs[index].routeName);
  };

  const flags = useFlags();

  const objPromotionalOffers = (
    flags.promotionalOffers ?? []
  ).filter((promotionalOffer) =>
    promotionalOffer.features.includes('Object Storage')
  );

  // A user needs to explicitly cancel Object Storage in their Account Settings in order to stop
  // being billed. If they have the service enabled but do not have any buckets, show a warning.
  const shouldDisplayBillingNotice =
    objectStorageBuckets.lastUpdated > 0 &&
    !objectStorageBuckets.bucketErrors &&
    objectStorageBuckets.data.length === 0 &&
    accountSettings.data?.object_storage === 'active';

  const matchesAccessKeys = Boolean(
    matchPath(props.location.pathname, {
      path: '/object-storage/access-keys',
      exact: true,
    })
  );

  const createButtonText = matchesAccessKeys
    ? 'Create Access Key'
    : 'Create Bucket';

  const createButtonWidth = matchesAccessKeys ? 180 : 152;

  const createButtonAction = () => {
    if (matchesAccessKeys) {
      setMode('creating');
      return createOrEditDrawer.open();
    } else {
      replace('/object-storage/buckets/create');
    }
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
      <LandingHeader
        title="Object Storage"
        entity="Object Storage"
        createButtonText={createButtonText}
        createButtonWidth={createButtonWidth}
        docsLink="https://www.linode.com/docs/platform/object-storage/"
        onAddNew={createButtonAction}
        removeCrumbX={1}
        breadcrumbProps={{ pathname: '/object-storage' }}
      />
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        {objPromotionalOffers.map((promotionalOffer) => (
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
              <AccessKeyLanding
                isRestrictedUser={_isRestrictedUser}
                accessDrawerOpen={createOrEditDrawer.isOpen}
                openAccessDrawer={openDrawer}
                closeAccessDrawer={createOrEditDrawer.close}
                mode={mode}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
        <BucketDrawer isRestrictedUser={_isRestrictedUser} />
      </Tabs>
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, {}>(React.memo, bucketDrawerContainer);

export default enhanced(ObjectStorageLanding);

// =============================================================================
// <BillingNotice/>
// ============================================================================
const useBillingNoticeStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles,
  },
}));

const NOTIFICATION_KEY = 'obj-billing-notification';

export const BillingNotice: React.FC<{}> = React.memo(() => {
  const classes = useBillingNoticeStyles();

  const dispatch: Dispatch = useDispatch();

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const openDrawer = () => dispatch(openBucketDrawer());

  const handleClose = () => {
    dismissNotifications([NOTIFICATION_KEY], {
      label: NOTIFICATION_KEY,
      expiry: DateTime.utc().plus({ days: 30 }).toISO(),
    });
  };

  if (hasDismissedNotifications([NOTIFICATION_KEY])) {
    return null;
  }

  return (
    <Notice warning important dismissible onClose={handleClose}>
      <Typography>
        You are being billed for Object Storage but do not have any Buckets. You
        can cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>, or{' '}
        <button className={classes.button} onClick={openDrawer}>
          create a Bucket.
        </button>
      </Typography>
    </Notice>
  );
});
