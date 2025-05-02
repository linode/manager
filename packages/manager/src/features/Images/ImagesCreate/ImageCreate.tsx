import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

const CreateImageTab = React.lazy(() =>
  import('./CreateImageTab').then((module) => ({
    default: module.CreateImageTab,
  }))
);

const ImageUpload = React.lazy(() =>
  import('./ImageUpload').then((module) => ({ default: module.ImageUpload }))
);

export const ImageCreate = () => {
  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Capture Image',
      to: '/images/create/disk',
    },
    {
      title: 'Upload Image',
      to: '/images/create/upload',
    },
  ]);

  return (
    <>
      <DocumentTitleSegment segment="Create an Image" />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <CreateImageTab />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <ImageUpload />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};
