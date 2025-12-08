import { useVolumeQuery } from '@linode/queries';
import { BetaChip, CircleProgress, ErrorState } from '@linode/ui';
import { Outlet, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { VolumeDrawers } from '../VolumeDrawers/VolumeDrawers';
import { VolumeDetailsHeader } from './VolumeDetailsHeader';

export const VolumeDetails = () => {
  const navigate = useNavigate();

  const { volumeSummaryPage, aclpServices } = useFlags();
  const { volumeId } = useParams({ from: '/volumes/$volumeId' });
  const { data: volume, isLoading, error } = useVolumeQuery(volumeId);
  const { tabs, handleTabChange, tabIndex } = useTabs([
    {
      to: '/volumes/$volumeId/summary',
      title: 'Summary',
    },
    {
      to: '/volumes/$volumeId/metrics',
      title: 'Metrics',
      hide: !aclpServices?.blockstorage?.metrics?.enabled,
      chip: aclpServices?.blockstorage?.metrics?.beta ? <BetaChip /> : null,
    },
  ]);

  if (!volumeSummaryPage || error) {
    return <ErrorState errorText={error?.[0].reason ?? 'Not found'} />;
  }

  if (isLoading || !volume) {
    return <CircleProgress />;
  }

  const navigateToVolumes = () => {
    navigate({
      search: (prev) => prev,
      to: '/volumes',
    });
  };

  const navigateToVolumeSummary = () => {
    navigate({
      search: (prev) => prev,
      to: `/volumes/${volume.id}/summary`,
    });
  };

  if (location.pathname === `/volumes/${volumeId}`) {
    navigateToVolumeSummary();
  }

  return (
    <>
      <VolumeDetailsHeader volume={volume} />

      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <Outlet />
          </TabPanels>
        </React.Suspense>
      </Tabs>

      <VolumeDrawers
        onCloseHandler={navigateToVolumeSummary}
        onDeleteSuccessHandler={navigateToVolumes}
      />
    </>
  );
};
