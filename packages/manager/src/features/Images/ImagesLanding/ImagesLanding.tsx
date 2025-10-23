import { BetaChip, Notice } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { ImagesLandingTable } from './ImagesLandingTable';
// const ImagesLandingTable = React.lazy(() =>
//   import('./ImagesLandingTable').then((module) => ({
//     default: module.ImagesLandingTable,
//   }))
// );

export const ImagesLanding = () => {
  const navigate = useNavigate();
  const flags = useFlags();

  const { data: permissions } = usePermissions('account', ['create_image']);
  const canCreateImage = permissions?.create_image;

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Images',
      to: '/images/images',
    },
    {
      title: 'Share Groups',
      to: '/images/sharegroups',
      chip: <BetaChip />,
      hide: !flags.privateImageSharing,
    },
  ]);

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Images',
          removeCrumbX: 1,
        }}
        buttonDataAttrs={{
          tooltipText: canCreateImage
            ? false
            : "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions.",
        }}
        disabledCreateButton={!canCreateImage}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/images"
        entity="Image"
        onButtonClick={() =>
          navigate({ search: () => ({}), to: '/images/create' })
        }
        spacingBottom={16}
        title="Images"
      />

      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <ImagesLandingTable />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <Notice variant="info">Share Groups is coming soon...</Notice>
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default ImagesLanding;
