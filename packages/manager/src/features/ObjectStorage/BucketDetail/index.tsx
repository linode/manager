import { BetaChip, CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useIsObjectStorageGen2Enabled } from 'src/features/ObjectStorage/hooks/useIsObjectStorageGen2Enabled';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

const ObjectList = React.lazy(() =>
  import('./ObjectsTab/BucketDetail').then((module) => ({
    default: module.BucketDetail,
  }))
);

const BucketAccess = React.lazy(() =>
  import('./AccessTab/BucketAccess').then((module) => ({
    default: module.BucketAccess,
  }))
);

const BucketSSL = React.lazy(() =>
  import('./CertificatesTab/BucketSSL').then((module) => ({
    default: module.BucketSSL,
  }))
);

const BucketMetrics = React.lazy(() =>
  import('./MetricsTab/MetricsTab').then((module) => ({
    default: module.MetricsTab,
  }))
);

const BUCKET_DETAILS_URL = '/object-storage/buckets/$clusterId/$bucketName';

export const BucketDetailLanding = React.memo(() => {
  const { bucketName, clusterId } = useParams({
    from: BUCKET_DETAILS_URL,
  });

  const { aclpServices } = useFlags();
  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  const {
    data: bucketsData,
    isLoading,
    error,
    isPending,
  } = useObjectStorageBuckets(isObjectStorageGen2Enabled);

  const bucket = bucketsData?.buckets.find(({ label }) => label === bucketName);

  const { endpoint_type } = bucket ?? {};

  const isGen2Endpoint = endpoint_type === 'E2' || endpoint_type === 'E3';

  const { handleTabChange, tabIndex, tabs, getTabIndex } = useTabs([
    {
      title: 'Objects',
      to: `${BUCKET_DETAILS_URL}/objects`,
    },
    {
      title: 'Access',
      to: `${BUCKET_DETAILS_URL}/access`,
    },
    {
      title: 'SSL/TLS',
      to: `${BUCKET_DETAILS_URL}/ssl`,
      hide: isGen2Endpoint,
    },
    {
      title: 'Metrics',
      to: `${BUCKET_DETAILS_URL}/metrics`,
      hide: !aclpServices?.objectstorage?.metrics?.enabled,
      chip: aclpServices?.objectstorage?.metrics?.beta ? <BetaChip /> : null,
    },
  ]);

  if (isPending || isLoading) {
    return <CircleProgress />;
  }

  if (!bucket || error) {
    return <ErrorState errorText={error?.message ?? 'Not found'} />;
  }

  const sslTabIndex = getTabIndex(`${BUCKET_DETAILS_URL}/ssl`);
  const metricsTabIndex = getTabIndex(`${BUCKET_DETAILS_URL}/metrics`);

  return (
    <>
      <ProductInformationBanner bannerLocation="Object Storage" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Object Storage',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          pathname: `/object-storage/${bucketName}`,
        }}
        // Purposefully not using the title prop here because we want to use the `bucketName` override.
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/platform/object-storage/"
        spacingBottom={4}
      />

      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <ObjectList />
            </SafeTabPanel>

            <SafeTabPanel index={1}>
              <BucketAccess
                bucketName={bucketName}
                clusterId={clusterId}
                endpointType={endpoint_type}
              />
            </SafeTabPanel>

            {!!sslTabIndex && (
              <SafeTabPanel index={sslTabIndex}>
                <BucketSSL bucketName={bucketName} clusterId={clusterId} />
              </SafeTabPanel>
            )}

            {!!metricsTabIndex && (
              <SafeTabPanel index={metricsTabIndex}>
                <BucketMetrics bucketName={bucketName} clusterId={clusterId} />
              </SafeTabPanel>
            )}
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});

export default BucketDetailLanding;
