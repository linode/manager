import { useAccountSettings, useProfile } from '@linode/queries';
import { LinkButton, Typography } from '@linode/ui';
import { useOpenClose } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import { useMatch, useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
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
import { CreateBucketDrawer } from './BucketLanding/CreateBucketDrawer';
import { OMC_BucketLanding } from './BucketLanding/OMC_BucketLanding';
import { OMC_CreateBucketDrawer } from './BucketLanding/OMC_CreateBucketDrawer';
import { useIsObjMultiClusterEnabled } from './hooks/useIsObjectStorageGen2Enabled';

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
  const flags = useFlags();
  const navigate = useNavigate();
  const match = useMatch({ strict: false });

  const [mode, setMode] = React.useState<MODE>('creating');

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  const { data: profile } = useProfile();
  const { data: accountSettings } = useAccountSettings();

  const isRestrictedUser = profile?.restricted ?? false;

  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const userHasNoBucketCreated =
    objectStorageBucketsResponse?.buckets.length === 0;

  const { handleTabChange, tabIndex, tabs } = useTabs([
    { title: 'Buckets', to: `/object-storage/buckets` },
    { title: 'Access Keys', to: `/object-storage/access-keys` },
  ]);

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

  const shouldHideDocsAndCreateButtons =
    !areBucketsLoading && tabIndex === 0 && userHasNoBucketCreated;

  const isAccessKeysTab = tabIndex === 1;

  const createButtonText = isAccessKeysTab
    ? 'Create Access Key'
    : 'Create Bucket';

  const openDrawer = useOpenClose();

  const handleOpenAccessDrawer = (mode: MODE) => {
    setMode(mode);
    openDrawer.open();
  };

  const createButtonAction = () => {
    if (isAccessKeysTab) {
      navigate({ to: '/object-storage/access-keys/create' });
      handleOpenAccessDrawer('creating');
    } else {
      navigate({ to: '/object-storage/buckets/create' });
    }
  };

  const isCreateBucketOpen = match.routeId === '/object-storage/buckets/create';
  const isCreateAccessKeyOpen =
    match.routeId === '/object-storage/access-keys/create';

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
        onButtonClick={createButtonAction}
        removeCrumbX={1}
        shouldHideDocsAndCreateButtons={shouldHideDocsAndCreateButtons}
        spacingBottom={4}
        title="Object Storage"
      />
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
                accessDrawerOpen={isCreateAccessKeyOpen || openDrawer.isOpen}
                closeAccessDrawer={() => {
                  navigate({ to: '/object-storage/access-keys' });
                  openDrawer.close();
                }}
                isRestrictedUser={isRestrictedUser}
                mode={mode}
                openAccessDrawer={handleOpenAccessDrawer}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
        {isObjMultiClusterEnabled ? (
          <OMC_CreateBucketDrawer
            isOpen={isCreateBucketOpen}
            onClose={() => navigate({ to: '/object-storage/buckets' })}
          />
        ) : (
          <CreateBucketDrawer
            isOpen={isCreateBucketOpen}
            onClose={() => navigate({ to: '/object-storage/buckets' })}
          />
        )}
      </Tabs>
    </React.Fragment>
  );
};

const NOTIFICATION_KEY = 'obj-billing-notification';

export const BillingNotice = React.memo(() => {
  const navigate = useNavigate();

  return (
    <DismissibleBanner
      options={{
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
        label: NOTIFICATION_KEY,
      }}
      preferenceKey={NOTIFICATION_KEY}
      variant="warning"
    >
      <Typography variant="body1">
        You are being billed for Object Storage but do not have any Buckets. You
        can cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>, or{' '}
        <LinkButton
          onClick={() => navigate({ to: '/object-storage/buckets/create' })}
        >
          create a Bucket.
        </LinkButton>
      </Typography>
    </DismissibleBanner>
  );
});

const StyledPromotionalOfferCard = styled(PromotionalOfferCard, {
  label: 'StyledPromotionalOfferCard',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));
