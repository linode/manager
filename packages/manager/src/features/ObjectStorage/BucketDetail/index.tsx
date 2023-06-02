import * as React from 'react';
import LandingHeader from 'src/components/LandingHeader';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { BucketAccess } from './BucketAccess';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { ObjectStorageClusterID } from '@linode/api-v4/lib/object-storage';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import type { ComponentType, LazyExoticComponent } from 'react';

const ObjectList: LazyExoticComponent<ComponentType<any>> = React.lazy(() =>
  import('./BucketDetail').then((module) => ({ default: module.BucketDetail }))
);
const BucketSSL = React.lazy(() =>
  import('./BucketSSL').then((module) => ({
    default: module.BucketSSL,
  }))
);

interface MatchProps {
  clusterId: ObjectStorageClusterID;
  bucketName: string;
}

type Props = RouteComponentProps<MatchProps>;

export const BucketDetailLanding = React.memo((props: Props) => {
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };
  const { bucketName, clusterId } = props.match.params;

  const tabs = [
    {
      title: 'Objects',
      routeName: `${props.match.url}/objects`,
    },
    {
      title: 'Access',
      routeName: `${props.match.url}/access`,
    },
    {
      title: 'SSL/TLS',
      routeName: `${props.match.url}/ssl`,
    },
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
      <LandingHeader
        // Purposefully not using the title prop here because we want to use the `bucketName` override.
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/platform/object-storage/"
        breadcrumbProps={{
          pathname: `/object-storage/${bucketName}`,
          labelOptions: { noCap: true },
          crumbOverrides: [
            {
              position: 1,
              label: 'Object Storage',
            },
          ],
        }}
      />

      <Tabs index={index} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <ObjectList {...props} />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <BucketAccess bucketName={bucketName} clusterId={clusterId} />
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
