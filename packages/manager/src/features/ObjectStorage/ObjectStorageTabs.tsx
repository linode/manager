import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import { OMC_BucketLanding } from './BucketLanding/OMC_BucketLanding';
import { BillingNotice } from './ObjectStorageBanners/BillingNotice';
import { StyledPromotionalOfferCard } from './ObjectStorageBanners/StyledPromotionalOfferCard';

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

export const ObjectStorageTabs = () => {
  const { promotionalOffers, objSummaryPage } = useFlags();

  const objPromotionalOffers =
    promotionalOffers?.filter((offer) =>
      offer.features.includes('Object Storage')
    ) ?? [];

  const objTabs: Tab[] = [
    { title: 'Buckets', to: '/object-storage/buckets' },
    { title: 'Access Keys', to: '/object-storage/access-keys' },
  ];

  // TODO: Remove condition when OBJ Summary is enabled
  if (objSummaryPage) {
    objTabs.unshift({ title: 'Summary', to: '/object-storage/summary' });
  }

  const { handleTabChange, tabIndex, tabs, getTabIndex } = useTabs(objTabs);

  const summaryTabIndex = getTabIndex('/object-storage/summary');
  const bucketsTabIndex = getTabIndex('/object-storage/buckets');
  const accessKeysTabIndex = getTabIndex('/object-storage/access-keys');

  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const userHasNoBucketCreated =
    objectStorageBucketsResponse?.buckets.length === 0;

  // Users must explicitly cancel Object Storage in their Account Settings to avoid being billed.
  // Display a warning if the service is active but no buckets are present.
  const shouldDisplayBillingNotice =
    !areBucketsLoading && !bucketsErrors && userHasNoBucketCreated;

  return (
    <Tabs index={tabIndex} onChange={handleTabChange}>
      <TanStackTabLinkList tabs={tabs} />

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
          {objSummaryPage && (
            <SafeTabPanel index={summaryTabIndex}>
              <SummaryLanding />
            </SafeTabPanel>
          )}

          <SafeTabPanel index={bucketsTabIndex}>
            <OMC_BucketLanding />
          </SafeTabPanel>

          <SafeTabPanel index={accessKeysTabIndex}>
            <AccessKeyLanding />
          </SafeTabPanel>
        </TabPanels>
      </React.Suspense>
    </Tabs>
  );
};
