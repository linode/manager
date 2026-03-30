import { BetaChip, Notice, Stack } from '@linode/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { getSubTabIndex } from 'src/features/Images/utils';

import { shareGroupsSubTabs as subTabs } from './shareGroupsTabsConfig';
import { ShareGroupsView } from './ShareGroupsView';

export const ShareGroupsTabs = () => {
  const navigate = useNavigate();

  const shareGroupsTypeParams = useParams({
    from: '/images/share-groups/$shareGroupsType',
    shouldThrow: false,
  });

  const onTabChange = (index: number) => {
    navigate({
      to: `/images/share-groups/$shareGroupsType`,
      params: {
        shareGroupsType: subTabs[index].type,
      },
    });
  };

  const subTabIndex = getSubTabIndex(
    subTabs,
    shareGroupsTypeParams?.shareGroupsType
  );

  return (
    <Stack spacing={3}>
      <Tabs index={subTabIndex} onChange={onTabChange}>
        <TabList>
          {subTabs.map((tab) => (
            <Tab data-pendo-id={tab.pendoId} key={`images-${tab.type}`}>
              {tab.title} {tab.isBeta ? <BetaChip /> : null}
            </Tab>
          ))}
        </TabList>
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            {subTabs.map((tab, index) => (
              <SafeTabPanel index={index} key={`images-${tab.type}-content`}>
                {tab.type === 'owned-groups' && (
                  <ShareGroupsView type="owned-groups" />
                )}
                {tab.type === 'joined-groups' && (
                  <Notice variant="info">
                    Joined Groups is coming soon...
                  </Notice>
                )}
                {tab.type === 'membership-requests' && (
                  <Notice variant="info">
                    Membership Requests is coming soon...
                  </Notice>
                )}
              </SafeTabPanel>
            ))}
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </Stack>
  );
};
