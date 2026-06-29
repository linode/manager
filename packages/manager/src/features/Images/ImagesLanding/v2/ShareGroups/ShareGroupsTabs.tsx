import { Font } from '@akamai/cds-tokens';
import { useShareGroupQuery } from '@linode/queries';
import { BetaChip, Stack } from '@linode/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { getSubTabIndex } from 'src/features/Images/utils';

import { DeleteShareGroupDialog } from './DeleteShareGroupDialog';
import { EditShareGroupDrawer } from './EditShareGroupDrawer';
import { MembershipRequestDrawer } from './MembershipRequestsDrawer/MembershipRequestDrawer';
import { AddMembersDrawer } from './ShareGroupsDetails/AddMembersDrawer';
import { shareGroupsSubTabs as subTabs } from './shareGroupsTabsConfig';
import { ShareGroupsView } from './ShareGroupsView';

import type { Handlers as ShareGroupHandlers } from './ShareGroupActionMenu';
import type { ShareGroupAction } from 'src/routes/images';

export const ShareGroupsTabs = () => {
  const navigate = useNavigate();

  const shareGroupsTypeParams = useParams({
    from: '/images/share-groups/$shareGroupsType',
    shouldThrow: false,
  });

  const ownedGroupsActionParams = useParams({
    from: '/images/share-groups/owned-groups/$shareGroupId/$action',
    shouldThrow: false,
  });

  const {
    data: selectedShareGroup,
    isLoading,
    error,
  } = useShareGroupQuery(
    ownedGroupsActionParams?.shareGroupId ?? '',
    !!ownedGroupsActionParams?.shareGroupId
  );

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

  const handleShareGroupAction = (
    shareGroupId: string,
    action: ShareGroupAction
  ) => {
    navigate({
      params: {
        shareGroupId,
        action,
      },
      search: (prev) => prev,
      to: '/images/share-groups/owned-groups/$shareGroupId/$action',
    });
  };

  const handleAddImages = (shareGroupId: string) => {
    handleShareGroupAction(shareGroupId, 'add-images');
  };

  const handleAddMembers = (shareGroupId: string) => {
    handleShareGroupAction(shareGroupId, 'add-members');
  };

  const handleDelete = (shareGroupId: string) => {
    handleShareGroupAction(shareGroupId, 'delete');
  };

  const handleEdit = (shareGroupId: string) => {
    handleShareGroupAction(shareGroupId, 'edit');
  };

  const goToOwnedGroupsTab = () =>
    navigate({
      to: '/images/share-groups/$shareGroupsType',
      params: {
        shareGroupsType: 'owned-groups',
      },
    });

  const goToShareGroupDetails = () =>
    navigate({
      search: (prev) => prev,
      to: '/images/share-groups/owned-groups/$shareGroupId',
      params: {
        shareGroupId: ownedGroupsActionParams?.shareGroupId ?? '',
      },
    });

  const handlers: ShareGroupHandlers = {
    onAddImages: handleAddImages,
    onAddMembers: handleAddMembers,
    onDelete: handleDelete,
    onEdit: handleEdit,
  };

  return (
    <Stack spacing={3}>
      <Tabs index={subTabIndex} onChange={onTabChange}>
        <TabList>
          {subTabs.map((tab) => (
            <Tab
              data-pendo-id={tab.pendoId}
              fontSize={Font.FontSize.Xs}
              key={`images-${tab.type}`}
            >
              {tab.title} {tab.isBeta ? <BetaChip /> : null}
            </Tab>
          ))}
        </TabList>
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            {subTabs.map((tab, index) => (
              <SafeTabPanel index={index} key={`images-${tab.type}-content`}>
                {tab.type === 'owned-groups' && (
                  <ShareGroupsView handlers={handlers} type="owned-groups" />
                )}
                {tab.type === 'joined-groups' && (
                  <ShareGroupsView type="joined-groups" />
                )}
                {tab.type === 'membership-requests' && (
                  <ShareGroupsView type="membership-requests" />
                )}
              </SafeTabPanel>
            ))}
          </TabPanels>
        </React.Suspense>
      </Tabs>
      <DeleteShareGroupDialog
        onClose={goToOwnedGroupsTab}
        onSuccess={goToOwnedGroupsTab}
        open={ownedGroupsActionParams?.action === 'delete'}
        shareGroupId={ownedGroupsActionParams?.shareGroupId}
      />
      <EditShareGroupDrawer
        errors={error}
        isFetching={isLoading}
        onClose={goToOwnedGroupsTab}
        open={ownedGroupsActionParams?.action === 'edit'}
        shareGroup={selectedShareGroup}
      />
      <AddMembersDrawer
        onClose={goToOwnedGroupsTab}
        onSuccess={goToShareGroupDetails}
        open={ownedGroupsActionParams?.action === 'add-members'}
        shareGroupId={ownedGroupsActionParams?.shareGroupId}
      />
      <MembershipRequestDrawer />
    </Stack>
  );
};
