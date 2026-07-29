import { useAccountSettings, useProfile } from '@linode/queries';
import { styled } from '@mui/material/styles';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import * as React from 'react';
import { useEffect } from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { PromotionalOfferCard } from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { useObjectStorageBuckets } from 'src/features/ObjectStorage/Buckets/hooks/useObjectStorageBuckets';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import './shared/index.css';
import { getRestrictedResourceText } from '../Account/utils';
import { AccessKeyDrawerOutlet } from './AccessKeys/AccessKeyDrawerOutlet';
import { useAccessKeyDrawers } from './AccessKeys/hooks/useAccessKeyDrawers';
import { BucketDrawerOutlet } from './Buckets/BucketDrawerOutlet';
import { BucketList } from './Buckets/BucketList';
import { useBucketDrawers } from './Buckets/hooks/useBucketDrawers';
import { ObjectStorageOnboarding } from './Onboarding/ObjectStorageOnboarding';
import { BillingNotice } from './shared/components/Notice/BillingNotice';

import type { Tab } from 'src/hooks/useTabs';

const EndpointSummaryView = React.lazy(() =>
  import('./Summary/EndpointSummaryPanel').then((module) => ({
    default: module.EndpointSummaryPanel,
  }))
);
const AccessKeyList = React.lazy(() =>
  import('./AccessKeys/AccessKeyList').then((module) => ({
    default: module.AccessKeyList,
  }))
);

export const ObjectStorageLanding = () => {
  const { promotionalOffers } = useFlags();
  const navigate = useNavigate();
  const { routeId } = useRouterState({
    select: (s) => s.matches[s.matches.length - 1],
  });

  const { data: profile } = useProfile();
  const { data: accountSettings } = useAccountSettings();
  const { openDrawer: openBucketDrawer } = useBucketDrawers();
  const { openDrawer: openAccessKeyDrawer } = useAccessKeyDrawers();

  const isRestrictedUser = profile?.restricted ?? false;

  const {
    data: buckets,
    bucketFetchFailedForAnyRegion,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const userHasNoBucketCreated = buckets?.length === 0;

  const objTabs: Tab[] = [
    { title: 'Summary', to: '/object-storage/summary' },
    { title: 'Buckets', to: '/object-storage/buckets' },
    { title: 'Access Keys', to: '/object-storage/access-keys' },
  ];

  const { handleTabChange, tabIndex, tabs } = useTabs(objTabs);

  const objPromotionalOffers =
    promotionalOffers?.filter((offer) =>
      offer.features.includes('Object Storage')
    ) ?? [];

  const isAccessKeysTab = tabIndex === 2;

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
  const isAtObjectStorageRoot = routeId === '/object-storage/';
  const isSummaryOpened = routeId === '/object-storage/summary';
  const isCreateBucketOpen = routeId === '/object-storage/buckets/create';
  const isOnboardingViewShown = !isObjectStorageEnabled || isRestrictedUser;

  // Users must explicitly cancel Object Storage in their Account Settings to avoid being billed.
  // Display a warning if the service is active but no buckets are present.
  const isBillingNoticeShown =
    !areBucketsLoading &&
    !bucketFetchFailedForAnyRegion &&
    userHasNoBucketCreated &&
    isObjectStorageEnabled;

  useEffect(() => {
    if (!isOnboardingViewShown && isAtObjectStorageRoot) {
      navigate({ to: '/object-storage/summary', replace: true });
      return;
    }
    if (isOnboardingViewShown && !isAtObjectStorageRoot) {
      if (isRestrictedUser) {
        navigate({ to: '/object-storage', replace: true });
        return;
      }

      if (!routeId.endsWith('/create')) {
        navigate({ to: '/object-storage', replace: true });
        return;
      }
    }
  }, [isOnboardingViewShown, isAtObjectStorageRoot, isRestrictedUser, routeId]);

  return (
    <>
      <DocumentTitleSegment
        segment={`${
          isCreateBucketOpen && !buckets?.length
            ? 'Create a Bucket'
            : 'Object Storage'
        }`}
      />

      {!isOnboardingViewShown && (
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
          spacingBottom={4}
          title="Object Storage"
        />
      )}

      {isOnboardingViewShown ? (
        <ObjectStorageOnboarding isRestricted={isRestrictedUser} />
      ) : (
        <>
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
                <SafeTabPanel index={0}>
                  <EndpointSummaryView />
                </SafeTabPanel>
                <SafeTabPanel index={1}>
                  <BucketList isCreateBucketDrawerOpen={isCreateBucketOpen} />
                </SafeTabPanel>
                <SafeTabPanel index={2}>
                  <AccessKeyList isRestrictedUser={isRestrictedUser} />
                </SafeTabPanel>
              </TabPanels>
            </React.Suspense>
          </Tabs>

          <TransferDisplay spacingTop={18} />
        </>
      )}

      <BucketDrawerOutlet />
      <AccessKeyDrawerOutlet />
    </>
  );
};

const StyledPromotionalOfferCard = styled(PromotionalOfferCard, {
  label: 'StyledPromotionalOfferCard',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));
