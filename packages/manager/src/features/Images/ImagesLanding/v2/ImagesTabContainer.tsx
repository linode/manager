import { imageQueries, useImageQuery } from '@linode/queries';
import { BetaChip, Drawer, Notice, Stack } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { getImagesSubTabIndex } from '../../utils';
import { DeleteImageDialog } from '../DeleteImageDialog';
import { EditImageDrawer } from '../EditImageDrawer';
import { ManageImageReplicasForm } from '../ImageRegions/ManageImageRegionsForm';
import { RebuildImageDrawer } from '../RebuildImageDrawer';
import { ImagesView } from './ImagesView';

import type { ImagesSubTab } from '../../utils';
import type { Handlers as ImageHandlers } from '../ImagesActionMenu';
import type { Image } from '@linode/api-v4';
import type { ImageAction } from 'src/routes/images';

export const ImagesTabContainer = () => {
  const navigate = useNavigate();

  const params = useParams({
    from: '/images/images/$imageId/$action',
    shouldThrow: false,
  });

  const search = useSearch({ from: '/images' });

  const queryClient = useQueryClient();

  const {
    data: selectedImage,
    isLoading: isFetchingSelectedImage,
    error: selectedImageError,
  } = useImageQuery(params?.imageId ?? '', !!params?.imageId);

  const actionHandler = (image: Image, action: ImageAction) => {
    navigate({
      params: { action, imageId: image.id },
      search: (prev) => prev,
      to: '/images/images/$imageId/$action',
    });
  };

  const handleEdit = (image: Image) => {
    actionHandler(image, 'edit');
  };

  const handleRebuild = (image: Image) => {
    actionHandler(image, 'rebuild');
  };

  const handleDelete = (image: Image) => {
    actionHandler(image, 'delete');
  };

  const handleCloseDialog = () => {
    navigate({
      search: (prev) => ({ ...prev, subType: search.subType }),
      to: '/images/images',
    });
  };

  const handleManageRegions = (image: Image) => {
    actionHandler(image, 'manage-replicas');
  };

  const onCancelFailedClick = () => {
    queryClient.invalidateQueries({
      queryKey: imageQueries.paginated._def,
    });
  };

  const handleDeployNewLinode = (imageId: string) => {
    navigate({
      to: '/linodes/create/images',
      search: {
        imageID: imageId,
      },
    });
  };

  const handlers: ImageHandlers = {
    onCancelFailed: onCancelFailedClick,
    onDelete: handleDelete,
    onDeploy: handleDeployNewLinode,
    onEdit: handleEdit,
    onManageRegions: handleManageRegions,
    onRebuild: handleRebuild,
  };

  const subTabs: ImagesSubTab[] = [
    { variant: 'custom', title: 'My custom images' },
    {
      variant: 'shared',
      title: 'Shared with me',
      isBeta: true,
    },
    { variant: 'recovery', title: 'Recovery images' },
  ];

  const subTabIndex = getImagesSubTabIndex(subTabs, search.subType);

  const onTabChange = (index: number) => {
    // - Update the "subType" query param.
    // - This switches between "My custom images", "Shared with me" and "Recovery images" tabs.
    navigate({
      to: `/images/images`,
      search: (prev) => ({
        ...prev,
        subType: subTabs[index]['variant'],
        // Reset search, pagination and sorting query params
        query: undefined,
        page: undefined,
        pageSize: undefined,
        'manual-order': undefined,
        'manual-orderBy': undefined,
        'automatic-order': undefined,
        'automatic-orderBy': undefined,
      }),
    });
  };

  return (
    <Stack spacing={3}>
      <Tabs index={subTabIndex} onChange={onTabChange}>
        <TabList>
          {subTabs.map((tab) => (
            <Tab key={`images-${tab.variant}`}>
              {tab.title} {tab.isBeta ? <BetaChip /> : null}
            </Tab>
          ))}
        </TabList>
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            {subTabs.map((tab, idx) => (
              <SafeTabPanel index={idx} key={`images-${tab.variant}-content`}>
                {tab.variant === 'custom' && (
                  <ImagesView handlers={handlers} variant="custom" />
                )}
                {tab.variant === 'shared' && (
                  <Notice variant="info">
                    Share with me is coming soon...
                  </Notice>
                )}
                {tab.variant === 'recovery' && (
                  <ImagesView handlers={handlers} variant="recovery" />
                )}
              </SafeTabPanel>
            ))}
          </TabPanels>
        </React.Suspense>
      </Tabs>
      <EditImageDrawer
        image={selectedImage}
        imageError={selectedImageError}
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={params?.action === 'edit'}
      />
      <RebuildImageDrawer
        image={selectedImage}
        imageError={selectedImageError}
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={params?.action === 'rebuild'}
      />
      <Drawer
        error={selectedImageError}
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={params?.action === 'manage-replicas'}
        title={`Manage Replicas for ${selectedImage?.label ?? 'Unknown'}`}
      >
        <ManageImageReplicasForm
          image={selectedImage}
          onClose={handleCloseDialog}
        />
      </Drawer>
      <DeleteImageDialog
        imageId={params?.imageId}
        onClose={handleCloseDialog}
        open={params?.action === 'delete'}
      />
    </Stack>
  );
};
