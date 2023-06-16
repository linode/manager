import * as React from 'react';
import LandingHeader from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { BucketAccess } from './BucketAccess';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { ObjectStorageClusterID } from '@linode/api-v4/lib/object-storage';
import type { ComponentType, LazyExoticComponent } from 'react';
import { Tab, Tabs } from '@mui/material';

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

      <Tabs value={index} onChange={(_, i) => handleTabChange(i)}>
        {tabs.map((t) => (
          <Tab key={t.title} label={t.title} />
        ))}
      </Tabs>
      <React.Suspense fallback={<SuspenseLoader />}>
        <SafeTabPanel value={index} index={0}>
          <ObjectList {...props} />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={1}>
          <BucketAccess bucketName={bucketName} clusterId={clusterId} />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={2}>
          <BucketSSL bucketName={bucketName} clusterId={clusterId} />
        </SafeTabPanel>
      </React.Suspense>
    </>
  );
});

export default BucketDetailLanding;
