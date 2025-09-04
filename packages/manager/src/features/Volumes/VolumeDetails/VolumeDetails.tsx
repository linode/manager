import { useVolumeQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { VolumeEntityDetail } from './VolumeEntityDetails/VolumeEntityDetail';

export const VolumeDetails = () => {
  const navigate = useNavigate();
  const { volumeSummaryPage } = useFlags();
  const { volumeId } = useParams({ from: '/volumes/$volumeId' });
  const { data: volume, isLoading, error } = useVolumeQuery(volumeId);
  const { tabs, handleTabChange, tabIndex, getTabIndex } = useTabs([
    {
      to: '/volumes/$volumeId/summary',
      title: 'Summary',
    },
  ]);

  if (!volumeSummaryPage || error) {
    return <ErrorState errorText={error?.[0].reason ?? 'Not found'} />;
  }

  if (isLoading || !volume) {
    return <CircleProgress />;
  }

  if (location.pathname === `/volumes/${volumeId}`) {
    navigate({ to: `/volumes/${volumeId}/summary` });
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: `/volumes/${volume.label}`,
        }}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances"
        entity="Volume"
        spacingBottom={16}
      />

      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={getTabIndex('/volumes/$volumeId/summary')}>
              <VolumeEntityDetail volume={volume} />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};
