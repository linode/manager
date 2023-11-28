import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { PromotionalOfferCard } from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useOpenClose } from 'src/hooks/useOpenClose';
import {
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';

import { MODE } from './AccessKeyLanding/types';
import { CreateBucketDrawer } from './BucketLanding/CreateBucketDrawer';

const BucketLanding = React.lazy(() =>
  import('./BucketLanding/BucketLanding').then((module) => ({
    default: module.BucketLanding,
  }))
);
const AccessKeyLanding = React.lazy(() =>
  import('./AccessKeyLanding/AccessKeyLanding').then((module) => ({
    default: module.AccessKeyLanding,
  }))
);

export const ObjectStorageLanding = () => {
  const history = useHistory();
  const [mode, setMode] = React.useState<MODE>('creating');
  const { action, tab } = useParams<{
    action?: 'create';
    tab?: 'access-keys' | 'buckets';
  }>();
  const isCreateBucketOpen = tab === 'buckets' && action === 'create';
  const { _isRestrictedUser, accountSettings } = useAccountManagement();
  const { data: objectStorageClusters } = useObjectStorageClusters();
  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets(objectStorageClusters);
  const userHasNoBucketCreated =
    objectStorageBucketsResponse?.buckets.length === 0;
  const createOrEditDrawer = useOpenClose();

  const tabs = [
    {
      routeName: `/object-storage/buckets`,
      title: 'Buckets',
    },
    {
      routeName: `/object-storage/access-keys`,
      title: 'Access Keys',
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
    }

    history.replace('/object-storage/buckets/create');
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
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
          <StyledPromotionalOfferCard
            key={promotionalOffer.name}
            {...promotionalOffer}
            fullWidth
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
                accessDrawerOpen={createOrEditDrawer.isOpen}
                closeAccessDrawer={createOrEditDrawer.close}
                isRestrictedUser={_isRestrictedUser}
                mode={mode}
                openAccessDrawer={openDrawer}
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

const NOTIFICATION_KEY = 'obj-billing-notification';

export const BillingNotice = React.memo(() => {
  const history = useHistory();

  return (
    <DismissibleBanner
      options={{
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
        label: NOTIFICATION_KEY,
      }}
      important
      preferenceKey={NOTIFICATION_KEY}
      variant="warning"
    >
      <Typography variant="body1">
        You are being billed for Object Storage but do not have any Buckets. You
        can cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>, or{' '}
        <StyledLinkButton
          onClick={() => history.replace('/object-storage/buckets/create')}
        >
          create a Bucket.
        </StyledLinkButton>
      </Typography>
    </DismissibleBanner>
  );
});

const StyledPromotionalOfferCard = styled(PromotionalOfferCard, {
  label: 'StyledPromotionalOfferCard',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));
