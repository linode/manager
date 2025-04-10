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
import { useTabs } from 'src/hooks/useTabs';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import { BucketAccess } from './BucketAccess';

const ObjectList = React.lazy(() =>
  import('./BucketDetail').then((module) => ({ default: module.BucketDetail }))
);
const BucketSSL = React.lazy(() =>
  import('./BucketSSL').then((module) => ({
    default: module.BucketSSL,
  }))
);

export const BucketDetailLanding = React.memo(() => {
  const { bucketName, clusterId } = useParams({
    from: '/object-storage/buckets/$clusterId/$bucketName',
  });

  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  const { data: bucketsData } = useObjectStorageBuckets(
    isObjectStorageGen2Enabled
  );

  const bucket = bucketsData?.buckets.find(({ label }) => label === bucketName);

  const { endpoint_type } = bucket ?? {};

  const isGen2Endpoint = endpoint_type === 'E2' || endpoint_type === 'E3';

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Objects',
      to: `/object-storage/buckets/$clusterId/$bucketName/objects`,
    },
    {
      title: 'Access',
      to: `/object-storage/buckets/$clusterId/$bucketName/access`,
    },

    {
      hide: isGen2Endpoint,
      title: 'SSL/TLS',
      to: `/object-storage/buckets/$clusterId/$bucketName/ssl`,
    },
  ]);

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
            <SafeTabPanel index={tabs.length - 1}>
              <BucketSSL bucketName={bucketName} clusterId={clusterId} />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});

export default BucketDetailLanding;
