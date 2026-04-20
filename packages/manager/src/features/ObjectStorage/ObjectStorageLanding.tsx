import { useAccountSettings, useProfile } from '@linode/queries';
import { styled } from '@mui/material/styles';
import { useMatch, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { PromotionalOfferCard } from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import { getRestrictedResourceText } from '../Account/utils';
import { AccessKeysDrawerOutlet } from './AccessKeyLanding/AccessKeysDrawerOutlet';
import { useAccessKeyDrawers } from './AccessKeyLanding/hooks/useAccessKeyDrawers';
import { BillingNotice } from './BillingNotice';
import { BucketDrawerOutlet } from './BucketLanding/BucketDrawerOutlet';
import { BucketLandingEmptyState } from './BucketLanding/BucketLandingEmptyState';
import { useBucketDrawers } from './BucketLanding/hooks/useBucketDrawers';
import { OMC_BucketLanding } from './BucketLanding/OMC_BucketLanding';

import type { Tab } from 'src/hooks/useTabs';

const SummaryLanding = React.lazy(() =>
  import('./SummaryLanding/SummaryLanding').then((module) => ({
    default: module.SummaryLanding,
  }))
);
const AccessKeyLanding = React.lazy(() =>
  import('./AccessKeyLanding/AccessKeyLanding').then((module) => ({
    default: module.AccessKeyLanding,
  }))
);

export const ObjectStorageLanding = () => {
  const { promotionalOffers, objSummaryPage } = useFlags();
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });

  const { data: profile } = useProfile();
  const { data: accountSettings } = useAccountSettings();
  const { openDrawer: openBucketDrawer } = useBucketDrawers();
  const { openDrawer: openAccessKeyDrawer } = useAccessKeyDrawers();

  const isRestrictedUser = profile?.restricted ?? false;

  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const userHasNoBucketCreated =
    objectStorageBucketsResponse?.buckets.length === 0;

  // TODO: Remove when OBJ Summary is enabled
  const objTabs: Tab[] = [
    { title: 'Buckets', to: '/object-storage/buckets' },
    { title: 'Access Keys', to: '/object-storage/access-keys' },
  ];

  if (objSummaryPage) {
    objTabs.unshift({ title: 'Summary', to: '/object-storage/summary' });
  }

  const { handleTabChange, tabIndex, tabs, getTabIndex } = useTabs(objTabs);

  const summaryTabIndex = getTabIndex('/object-storage/summary');
  const bucketsTabIndex = getTabIndex('/object-storage/buckets');
  const accessKeysTabIndex = getTabIndex('/object-storage/access-keys');

  const objPromotionalOffers =
    promotionalOffers?.filter((offer) =>
      offer.features.includes('Object Storage')
    ) ?? [];

  const shouldHideDocsAndCreateButtons =
    !areBucketsLoading &&
    tabIndex === bucketsTabIndex &&
    userHasNoBucketCreated;

  const isAccessKeysTab = tabIndex === accessKeysTabIndex;

  const createButtonText = isAccessKeysTab
    ? 'Create Access Key'
    : 'Create Bucket';

  const createButtonAction = () => {
    if (isAccessKeysTab) {
      openAccessKeyDrawer('create-access-key');
    } else {
      openBucketDrawer('create-bucket');
    }
  };

  const isObjectStorageEnabled = accountSettings?.object_storage === 'active';
  const isObjectStorageOpened = routeId === '/object-storage/';
  const isSummaryOpened = routeId === '/object-storage/summary';
  const isCreateBucketOpen = routeId === '/object-storage/buckets/create';
  const isLandingPageShown = !isObjectStorageEnabled || isRestrictedUser;

  // Users must explicitly cancel Object Storage in their Account Settings to avoid being billed.
  // Display a warning if the service is active but no buckets are present.
  const isBillingNoticeShown =
    !areBucketsLoading &&
    !bucketsErrors &&
    userHasNoBucketCreated &&
    isObjectStorageEnabled;

  if (!isLandingPageShown && isObjectStorageOpened) {
    // TODO: Remove condition when OBJ Summary is enabled
    navigate({
      to: objSummaryPage
        ? '/object-storage/summary'
        : '/object-storage/buckets',
    });
    return;
  }

  if (isLandingPageShown && !isObjectStorageOpened) {
    if (isRestrictedUser) {
      navigate({ to: '/object-storage' });
      return;
    }

    if (!routeId.endsWith('/create')) {
      navigate({ to: '/object-storage' });
      return;
    }
  }

  return (
    <>
      <DocumentTitleSegment
        segment={`${
          isCreateBucketOpen && !objectStorageBucketsResponse?.buckets.length
            ? 'Create a Bucket'
            : 'Object Storage'
        }`}
      />

      {!isLandingPageShown && (
        <LandingHeader
          breadcrumbProps={{ pathname: '/object-storage' }}
          buttonDataAttrs={{
            tooltipText: getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'Buckets',
            }),
          }}
          createButtonText={createButtonText}
          disabledCreateButton={isRestrictedUser}
          docsLink="https://www.linode.com/docs/platform/object-storage/"
          entity="Object Storage"
          onButtonClick={isSummaryOpened ? undefined : createButtonAction}
          removeCrumbX={1}
          shouldHideDocsAndCreateButtons={shouldHideDocsAndCreateButtons}
          spacingBottom={4}
          title="Object Storage"
        />
      )}

      {isLandingPageShown ? (
        <BucketLandingEmptyState isRestricted={isRestrictedUser} />
      ) : (
        <Tabs index={tabIndex} onChange={handleTabChange}>
          <TanStackTabLinkList tabs={tabs} />

          {objPromotionalOffers.map((promotionalOffer) => (
            <StyledPromotionalOfferCard
              key={promotionalOffer.name}
              {...promotionalOffer}
              fullWidth
            />
          ))}
          {isBillingNoticeShown && <BillingNotice />}

          <React.Suspense fallback={<SuspenseLoader />}>
            <TabPanels>
              {objSummaryPage && (
                <SafeTabPanel index={summaryTabIndex}>
                  <SummaryLanding />
                </SafeTabPanel>
              )}
              <SafeTabPanel index={bucketsTabIndex}>
                <OMC_BucketLanding
                  isCreateBucketDrawerOpen={isCreateBucketOpen}
                />
              </SafeTabPanel>
              <SafeTabPanel index={accessKeysTabIndex}>
                <AccessKeyLanding isRestrictedUser={isRestrictedUser} />
              </SafeTabPanel>
            </TabPanels>
          </React.Suspense>
        </Tabs>
      )}

      <BucketDrawerOutlet />
      <AccessKeysDrawerOutlet />
    </>
  );
};

const StyledPromotionalOfferCard = styled(PromotionalOfferCard, {
  label: 'StyledPromotionalOfferCard',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));
