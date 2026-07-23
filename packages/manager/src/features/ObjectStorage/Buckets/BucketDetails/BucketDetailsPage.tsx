import { useRegionQuery } from '@linode/queries';
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
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';
import { useCloudPulseServiceByServiceType } from 'src/queries/cloudpulse/services';

import { getEndpointCapabilities } from '../../shared/endpointCapabilities';
import { useObjectStorageBuckets } from './../hooks/useObjectStorageBuckets';

const BucketObjectsPanel = React.lazy(() =>
  import('./Objects/BucketObjectsPanel').then((module) => ({
    default: module.BucketObjectsPanel,
  }))
);

const BucketAccessPanel = React.lazy(() =>
  import('./Access/BucketAccessPanel').then((module) => ({
    default: module.BucketAccessPanel,
  }))
);

const BucketCustomCertificatePanel = React.lazy(() =>
  import('./Certificates/BucketCustomCertificatePanel').then((module) => ({
    default: module.BucketCustomCertificatePanel,
  }))
);

const BucketMetricsPanel = React.lazy(() =>
  import('./Metrics/BucketMetricsPanel').then((module) => ({
    default: module.BucketMetricsPanel,
  }))
);

const BUCKET_DETAILS_URL = '/object-storage/buckets/$regionId/$bucketName';
const OBJECT_STORAGE_METRICS_KEY = 'Object Storage';

export const BucketDetailsPage = React.memo(() => {
  const { bucketName, regionId } = useParams({
    from: BUCKET_DETAILS_URL,
  });

  const { aclpServices, objectStorageContextualMetrics } = useFlags();
  const { isError: aclpServiceError, isLoading: aclServiceLoading } =
    useCloudPulseServiceByServiceType('objectstorage', true);

  const {
    data: buckets,
    isLoading: bucketsLoading,
    error,
    isPending: bucketsPending,
  } = useObjectStorageBuckets();

  const bucket = buckets?.find(
    ({ label, region }) => label === bucketName && region === regionId
  );

  const {
    data: region,
    isLoading: regionLoading,
    error: regionError,
  } = useRegionQuery(bucket?.region || '');

  const endpointType = bucket ? (bucket.endpoint_type ?? 'E0') : undefined;

  const endpointCapabilities = getEndpointCapabilities(endpointType);

  const regionSupportsMetrics = region?.monitors?.metrics?.includes(
    OBJECT_STORAGE_METRICS_KEY
  );

  const isBucketMetricsTabHidden =
    !endpointType ||
    !endpointCapabilities.metrics ||
    aclpServiceError ||
    !aclpServices?.objectstorage?.metrics?.enabled ||
    !objectStorageContextualMetrics ||
    !regionSupportsMetrics ||
    !!regionError;

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
      hide: !endpointCapabilities.customTlsCertificate,
    },
    {
      title: 'Metrics',
      to: `${BUCKET_DETAILS_URL}/metrics`,
      hide: isBucketMetricsTabHidden,
      chip: aclpServices?.objectstorage?.metrics?.beta ? <BetaChip /> : null,
    },
  ]);

  if (bucketsPending || bucketsLoading || regionLoading || aclServiceLoading) {
    return <CircleProgress />;
  }

  if (!bucket || error) {
    return <ErrorState errorText={error ?? 'Not found'} />;
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
              <BucketObjectsPanel />
            </SafeTabPanel>

            <SafeTabPanel index={1}>
              <BucketAccessPanel
                bucketName={bucketName}
                endpointType={endpointType}
                regionId={regionId}
              />
            </SafeTabPanel>

            {!!sslTabIndex && (
              <SafeTabPanel index={sslTabIndex}>
                <BucketCustomCertificatePanel
                  bucketName={bucketName}
                  regionId={regionId}
                />
              </SafeTabPanel>
            )}

            {!!metricsTabIndex && (
              <SafeTabPanel index={metricsTabIndex}>
                <BucketMetricsPanel
                  hostname={bucket.hostname}
                  region={bucket.region}
                />
              </SafeTabPanel>
            )}
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});

export default BucketDetailsPage;
