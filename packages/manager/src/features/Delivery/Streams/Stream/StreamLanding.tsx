import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  LandingHeader,
  type LandingHeaderProps,
} from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { StreamMetrics } from 'src/features/Delivery/Streams/Stream/StreamMetrics';
import { StreamEdit } from 'src/features/Delivery/Streams/StreamForm/StreamEdit';
import { useTabs } from 'src/hooks/useTabs';

export const StreamLanding = () => {
  const { streamId } = useParams({
    strict: false,
  });

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Summary',
      to: `/logs/delivery/streams/$streamId/summary`,
    },
    {
      title: 'Metrics',
      to: `/logs/delivery/streams/$streamId/metrics`,
    },
  ]);

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/logs/delivery/streams/summary',
      crumbOverrides: [
        {
          label: 'Delivery',
          linkTo: '/logs/delivery/streams',
          position: 1,
        },
      ],
    },
    docsLink: 'https://techdocs.akamai.com/cloud-computing/docs/log-delivery',
    removeCrumbX: [1, 2],
    title: `Stream ${streamId}`,
  };

  return (
    <>
      <DocumentTitleSegment segment="Stream" />
      <LandingHeader {...landingHeaderProps} />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <StreamEdit />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <StreamMetrics />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};
