import * as React from 'react';
import { matchPath } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

import { BucketAccess } from './BucketAccess';

import type { ObjectStorageClusterID } from '@linode/api-v4/lib/object-storage';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { RouteComponentProps } from 'react-router-dom';

const ObjectList: LazyExoticComponent<ComponentType<any>> = React.lazy(() =>
  import('./BucketDetail').then((module) => ({ default: module.BucketDetail }))
);
const BucketSSL = React.lazy(() =>
  import('./BucketSSL').then((module) => ({
    default: module.BucketSSL,
  }))
);

interface MatchProps {
  bucketName: string;
  clusterId: ObjectStorageClusterID;
}

type Props = RouteComponentProps<MatchProps>;

export const BucketDetailLanding = React.memo((props: Props) => {
  const { data: account } = useAccount();
  const flags = useFlags();

  const isObjectStorageGen2Enabled = isFeatureEnabledV2(
    'Object Storage Endpoint Types',
    Boolean(flags.objectStorageGen2?.enabled),
    account?.capabilities ?? []
  );

  const { data: bucketsData } = useObjectStorageBuckets(
    isObjectStorageGen2Enabled
  );

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };
  const { bucketName, clusterId } = props.match.params;

  const { endpoint_type: endpointType } =
    bucketsData?.buckets.find(({ label }) => label === bucketName) ?? {};

  const isSSLEnabled = endpointType !== 'E2' && endpointType === 'E3';

  const tabs = [
    {
      routeName: `${props.match.url}/objects`,
      title: 'Objects',
    },
    {
      routeName: `${props.match.url}/access`,
      title: 'Access',
    },
    ...(!isSSLEnabled
      ? [
          {
            routeName: `${props.match.url}/ssl`,
            title: 'SSL/TLS',
          },
        ]
      : []),
  ];

  const [index, setIndex] = React.useState(
    tabs.findIndex((tab) => matches(tab.routeName)) || 0
  );

  const handleTabChange = (index: number) => {
    setIndex(index);
    props.history.push(tabs[index].routeName);
  };

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

      <Tabs index={index} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <ObjectList {...props} endpointType={endpointType} />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <BucketAccess
                bucketName={bucketName}
                clusterId={clusterId}
                endpointType={endpointType}
              />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <BucketSSL bucketName={bucketName} clusterId={clusterId} />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});

export default BucketDetailLanding;
