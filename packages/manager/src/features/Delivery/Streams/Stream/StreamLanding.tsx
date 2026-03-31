import { useStreamQuery } from '@linode/queries';
import { Box, CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';
import { useMemo } from 'react';

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
import { useIsACLPLogsEnabled } from 'src/features/Delivery/deliveryUtils';
import { StreamMetrics } from 'src/features/Delivery/Streams/Stream/StreamMetrics';
import { StreamEdit } from 'src/features/Delivery/Streams/StreamForm/StreamEdit';
import { useTabs } from 'src/hooks/useTabs';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Tab } from 'src/hooks/useTabs';

export const StreamLanding = () => {
  const { streamId } = useParams({
    strict: false,
  });
  const { isACLPLogsMetricsEnabled } = useIsACLPLogsEnabled();

  const activeTabs = useMemo(() => {
    const result: Tab[] = [
      {
        title: 'Summary',
        to: `/logs/delivery/streams/$streamId/summary`,
      },
    ];

    if (isACLPLogsMetricsEnabled) {
      result.push({
        title: 'Metrics',
        to: `/logs/delivery/streams/$streamId/metrics`,
      });
    }

    return result;
  }, [isACLPLogsMetricsEnabled]);

  const { handleTabChange, tabIndex, tabs } = useTabs(activeTabs);

  const { isLoading: isLoadingStream, error: errorStream } = useStreamQuery(
    Number(streamId)
  );
  const streamErrorDefaultMessage =
    'There was an error retrieving stream. Please reload and try again.';

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

  if (isLoadingStream) {
    return (
      <Box display="flex" justifyContent="center">
        <CircleProgress />
      </Box>
    );
  }

  if (errorStream) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(errorStream, streamErrorDefaultMessage)[0].reason
        }
      />
    );
  }

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
