import { BetaChip, Notice, Stack } from '@linode/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { getImageLibrarySubTabIndex } from '../../../utils';
import { imageLibrarySubTabs as subTabs } from './imageLibraryTabsConfig';

export const ImageLibraryTabs = () => {
  const navigate = useNavigate();

  const params = useParams({
    from: '/images/image-library/$imageType',
    shouldThrow: false,
  });

  const subTabIndex = getImageLibrarySubTabIndex(subTabs, params?.imageType);

  const onTabChange = (index: number) => {
    // - Update the "imageType" param.
    // - This switches between "Owned by me", "Shared with me" and "Recovery images" sub-tabs within the Image Library tab.
    navigate({
      to: `/images/image-library/$imageType`,
      params: {
        imageType: subTabs[index].type,
      },
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
                {tab.type === 'owned-by-me' && (
                  // <ImagesView handlers={handlers} type="owned-by-me" />
                  <Notice variant="info">Custom Images</Notice>
                )}
                {tab.type === 'shared-with-me' && (
                  <Notice variant="info">
                    Share with me is coming soon...
                  </Notice>
                )}
                {tab.type === 'recovery-images' && (
                  // <ImagesView handlers={handlers} type="recovery-images" />
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
