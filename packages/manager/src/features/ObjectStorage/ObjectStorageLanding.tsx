import { StyledLinkButton, Typography } from '@linode/ui';
import { isFeatureEnabledV2, useOpenClose } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { PromotionalOfferCard } from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import { getRestrictedResourceText } from '../Account/utils';
import { CreateBucketDrawer } from './BucketLanding/CreateBucketDrawer';
import { OMC_BucketLanding } from './BucketLanding/OMC_BucketLanding';
import { OMC_CreateBucketDrawer } from './BucketLanding/OMC_CreateBucketDrawer';

import type { MODE } from './AccessKeyLanding/types';

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

  const {
    _isRestrictedUser,
    account,
    accountSettings,
  } = useAccountManagement();
  const flags = useFlags();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const userHasNoBucketCreated =
    objectStorageBucketsResponse?.buckets.length === 0;

  const openDrawer = useOpenClose();

  const tabs = [
    { routeName: `/object-storage/buckets`, title: 'Buckets' },
    { routeName: `/object-storage/access-keys`, title: 'Access Keys' },
  ];

  const handleOpenAccessDrawer = (mode: MODE) => {
    setMode(mode);
    openDrawer.open();
  };

  const navToURL = (index: number) => history.push(tabs[index].routeName);

  const objPromotionalOffers =
    flags.promotionalOffers?.filter((offer) =>
      offer.features.includes('Object Storage')
    ) ?? [];

  // Users must explicitly cancel Object Storage in their Account Settings to avoid being billed.
  // Display a warning if the service is active but no buckets are present.
  const shouldDisplayBillingNotice =
    !areBucketsLoading &&
    !bucketsErrors &&
    userHasNoBucketCreated &&
    accountSettings?.object_storage === 'active';

  const isBucketCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_buckets',
  });

  const shouldHideDocsAndCreateButtons =
    !areBucketsLoading && tab === 'buckets' && userHasNoBucketCreated;

  const isAccessKeysTab = tab === 'access-keys';
  const isCreateAction = action === 'create';

  const createButtonText = isAccessKeysTab
    ? 'Create Access Key'
    : 'Create Bucket';

  const createButtonAction = () => {
    if (isAccessKeysTab) {
      setMode('creating');
      history.replace('/object-storage/access-keys/create');
      openDrawer.open();
    } else {
      history.replace('/object-storage/buckets/create');
    }
  };

  const tabIndex = tab === 'access-keys' ? 1 : 0;
  const isCreateBucketOpen = !isAccessKeysTab && isCreateAction;
  const isCreateAccessKeyOpen = isAccessKeysTab && isCreateAction;

  return (
    <React.Fragment>
      <DocumentTitleSegment
        segment={`${
          isCreateBucketOpen && !objectStorageBucketsResponse?.buckets.length
            ? 'Create a Bucket'
            : 'Object Storage'
        }`}
      />
      <LandingHeader
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Buckets',
          }),
        }}
        breadcrumbProps={{ pathname: '/object-storage' }}
        createButtonText={createButtonText}
        disabledCreateButton={isBucketCreationRestricted}
        docsLink="https://www.linode.com/docs/platform/object-storage/"
        entity="Object Storage"
        onButtonClick={createButtonAction}
        removeCrumbX={1}
        shouldHideDocsAndCreateButtons={shouldHideDocsAndCreateButtons}
        title="Object Storage"
      />
      <Tabs index={tabIndex} onChange={navToURL}>
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
              {isObjMultiClusterEnabled ? (
                <OMC_BucketLanding
                  isCreateBucketDrawerOpen={isCreateBucketOpen}
                />
              ) : (
                <BucketLanding isCreateBucketDrawerOpen={isCreateBucketOpen} />
              )}
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <AccessKeyLanding
                closeAccessDrawer={() => {
                  openDrawer.close();
                  history.replace('/object-storage/access-keys');
                }}
                accessDrawerOpen={isCreateAccessKeyOpen || openDrawer.isOpen}
                isRestrictedUser={_isRestrictedUser}
                mode={mode}
                openAccessDrawer={handleOpenAccessDrawer}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
        {isObjMultiClusterEnabled ? (
          <OMC_CreateBucketDrawer
            isOpen={isCreateBucketOpen}
            onClose={() => history.replace('/object-storage/buckets')}
          />
        ) : (
          <CreateBucketDrawer
            isOpen={isCreateBucketOpen}
            onClose={() => history.replace('/object-storage/buckets')}
          />
        )}
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

export const objectStorageLandingLazyRoute = createLazyRoute('/object-storage')(
  {
    component: ObjectStorageLanding,
  }
);
