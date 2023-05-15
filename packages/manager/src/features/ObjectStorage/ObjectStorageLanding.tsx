import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import DismissibleBanner from 'src/components/DismissibleBanner';
import LandingHeader from 'src/components/LandingHeader';
import ProductInformationBanner from 'src/components/ProductInformationBanner';
import PromotionalOfferCard from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import Typography from 'src/components/core/Typography';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import useOpenClose from 'src/hooks/useOpenClose';
import { CreateBucketDrawer } from './BucketLanding/CreateBucketDrawer';
import { DateTime } from 'luxon';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { makeStyles } from '@mui/styles';
import { MODE } from './AccessKeyLanding/types';
import { Theme } from '@mui/material/styles';
import {
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';

const BucketLanding = React.lazy(() => import('./BucketLanding/BucketLanding'));
const AccessKeyLanding = React.lazy(
  () => import('./AccessKeyLanding/AccessKeyLanding')
);

const useStyles = makeStyles((theme: Theme) => ({
  promo: {
    marginBottom: theme.spacing(0.5),
  },
}));

export const ObjectStorageLanding = () => {
  const classes = useStyles();
  const history = useHistory();
  const [mode, setMode] = React.useState<MODE>('creating');
  const { action, tab } = useParams<{
    action?: 'create';
    tab?: 'buckets' | 'access-keys';
  }>();
  const isCreateBucketOpen = tab === 'buckets' && action === 'create';
  const { _isRestrictedUser, accountSettings } = useAccountManagement();
  const { data: objectStorageClusters } = useObjectStorageClusters();
  const {
    data: objectStorageBucketsResponse,
    isLoading: areBucketsLoading,
    error: bucketsErrors,
  } = useObjectStorageBuckets(objectStorageClusters);
  const userHasNoBucketCreated =
    objectStorageBucketsResponse?.buckets.length === 0;
  const createOrEditDrawer = useOpenClose();

  const tabs = [
    {
      title: 'Buckets',
      routeName: `/object-storage/buckets`,
    },
    {
      title: 'Access Keys',
      routeName: `/object-storage/access-keys`,
    },
  ];

  const realTabs = ['buckets', 'access-keys'];

  const openDrawer = (mode: MODE) => {
    setMode(mode);
    createOrEditDrawer.open();
  };

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
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
    !areBucketsLoading &&
    !bucketsErrors &&
    userHasNoBucketCreated &&
    accountSettings?.object_storage === 'active';

  // No need to display header since the it is redundant with the docs and CTA of the empty state
  // Meanwhile it will still display the header for the access keys tab at all times
  const shouldHideDocsAndCreateButtons =
    !areBucketsLoading && tab === 'buckets' && userHasNoBucketCreated;

  const createButtonText =
    tab === 'access-keys' ? 'Create Access Key' : 'Create Bucket';

  const createButtonAction = () => {
    if (tab === 'access-keys') {
      setMode('creating');
      return createOrEditDrawer.open();
    } else {
      history.replace('/object-storage/buckets/create');
    }
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
      <ProductInformationBanner bannerLocation="Object Storage" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/object-storage' }}
        createButtonText={createButtonText}
        docsLink="https://www.linode.com/docs/platform/object-storage/"
        entity="Object Storage"
        onButtonClick={createButtonAction}
        removeCrumbX={1}
        shouldHideDocsAndCreateButtons={shouldHideDocsAndCreateButtons}
        title="Object Storage"
      />
      <Tabs
        index={
          realTabs.findIndex((t) => t === tab) !== -1
            ? realTabs.findIndex((t) => t === tab)
            : 0
        }
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
              <BucketLanding />
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
        <CreateBucketDrawer
          isOpen={isCreateBucketOpen}
          onClose={() => history.replace('/object-storage/buckets')}
        />
      </Tabs>
    </React.Fragment>
  );
};

export default ObjectStorageLanding;

const useBillingNoticeStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles,
  },
}));

const NOTIFICATION_KEY = 'obj-billing-notification';

export const BillingNotice = React.memo(() => {
  const classes = useBillingNoticeStyles();
  const history = useHistory();

  return (
    <DismissibleBanner
      warning
      important
      preferenceKey={NOTIFICATION_KEY}
      options={{
        label: NOTIFICATION_KEY,
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
      }}
    >
      <Typography variant="body1">
        You are being billed for Object Storage but do not have any Buckets. You
        can cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>, or{' '}
        <button
          className={classes.button}
          onClick={() => history.replace('/object-storage/buckets/create')}
        >
          create a Bucket.
        </button>
      </Typography>
    </DismissibleBanner>
  );
});
