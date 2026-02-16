import { BetaChip, Notice, Stack } from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { getImagesLibrarySubTabIndex } from '../../utils';

import type { ImagesLibrarySubTab } from '../../utils';

export const ImagesLibraryTabs = () => {
  const navigate = useNavigate();

  const search = useSearch({ from: '/images' });

  const subTabs: ImagesLibrarySubTab[] = [
    { type: 'custom', title: 'My custom images' },
    {
      type: 'shared',
      title: 'Shared with me',
      isBeta: true,
    },
    { type: 'recovery', title: 'Recovery images' },
  ];

  const subTabIndex = getImagesLibrarySubTabIndex(subTabs, search.subType);

  const onTabChange = (index: number) => {
    // - Update the "subType" query param.
    // - This switches between "My custom images", "Shared with me" and "Recovery images" sub-tabs within the Images Library tab.
    navigate({
      to: `/images/images-library`,
      search: (prev) => ({
        ...prev,
        subType: subTabs[index].type,
      }),
    });
  };

  return (
    <Stack spacing={3}>
      <Tabs index={subTabIndex} onChange={onTabChange}>
        <TabList>
          {subTabs.map((tab) => (
            <Tab key={`images-${tab.type}`}>
              {tab.title} {tab.isBeta ? <BetaChip /> : null}
            </Tab>
          ))}
        </TabList>
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            {subTabs.map((tab, idx) => (
              <SafeTabPanel index={idx} key={`images-${tab.type}-content`}>
                {tab.type === 'custom' && (
                  // <ImagesView handlers={handlers} type="custom" />
                  <Notice variant="info">Custom Images</Notice>
                )}
                {tab.type === 'shared' && (
                  <Notice variant="info">
                    Share with me is coming soon...
                  </Notice>
                )}
                {tab.type === 'recovery' && (
                  // <ImagesView handlers={handlers} type="recovery" />
                  <Notice variant="info">Recovery Images</Notice>
                )}
              </SafeTabPanel>
            ))}
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </Stack>
  );
};
