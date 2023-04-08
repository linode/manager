import * as React from 'react';
import { DateTime } from 'luxon';
import { useHistory, useParams } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import ProductInformationBanner from 'src/components/ProductInformationBanner';
import PromotionalOfferCard from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import useOpenClose from 'src/hooks/useOpenClose';
import { MODE } from './AccessKeyLanding/types';
import { CreateBucketDrawer } from './BucketLanding/CreateBucketDrawer';
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
    objectStorageBucketsResponse?.buckets.length === 0 &&
    accountSettings?.object_storage === 'active';

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
        title="Object Storage"
        entity="Object Storage"
        createButtonText={createButtonText}
        docsLink="https://www.linode.com/docs/platform/object-storage/"
        onButtonClick={createButtonAction}
        removeCrumbX={1}
        breadcrumbProps={{ pathname: '/object-storage' }}
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
      <Typography>
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
