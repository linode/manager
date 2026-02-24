import { imageQueries, useImageQuery, useQueryClient } from '@linode/queries';
import { BetaChip, Drawer, Notice, Stack } from '@linode/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { getImageLibrarySubTabIndex } from '../../../utils';
import { DeleteImageDialog } from '../../DeleteImageDialog';
import { EditImageDrawer } from '../../EditImageDrawer';
import { ManageImageReplicasForm } from '../../ImageRegions/ManageImageRegionsForm';
import { RebuildImageDrawer } from '../../RebuildImageDrawer';
import { imageLibrarySubTabs as subTabs } from './imageLibraryTabsConfig';
import { ImagesView } from './ImagesView';

import type { Handlers as ImageHandlers } from '../../ImagesActionMenu';
import type { Image } from '@linode/api-v4';
import type { ImageAction } from 'src/routes/images';

export const ImageLibraryTabs = () => {
  const navigate = useNavigate();

  const imageActionParams = useParams({
    from: '/images/image-library/$imageType/$imageId/$action',
    shouldThrow: false,
  });

  const imageTypeParams = useParams({
    from: '/images/image-library/$imageType',
    shouldThrow: false,
  });

  const queryClient = useQueryClient();

  const {
    data: selectedImage,
    isLoading: isFetchingSelectedImage,
    error: selectedImageError,
  } = useImageQuery(
    imageActionParams?.imageId ?? '',
    !!imageActionParams?.imageId
  );

  const actionHandler = (image: Image, action: ImageAction) => {
    navigate({
      params: {
        action,
        imageId: image.id,
        imageType: imageTypeParams?.imageType ?? 'owned-by-me',
      },
      search: (prev) => prev,
      to: '/images/image-library/$imageType/$imageId/$action',
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
      search: (prev) => prev,
      to: '/images/image-library/$imageType',
      params: { imageType: imageTypeParams?.imageType ?? 'owned-by-me' },
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

  const subTabIndex = getImageLibrarySubTabIndex(
    subTabs,
    imageTypeParams?.imageType
  );

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
                  <ImagesView handlers={handlers} type="owned-by-me" />
                )}
                {tab.type === 'shared-with-me' && (
                  <Notice variant="info">
                    Share with me is coming soon...
                  </Notice>
                )}
                {tab.type === 'recovery-images' && (
                  <ImagesView handlers={handlers} type="recovery-images" />
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
        open={imageActionParams?.action === 'edit'}
      />
      <RebuildImageDrawer
        image={selectedImage}
        imageError={selectedImageError}
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={imageActionParams?.action === 'rebuild'}
      />
      <Drawer
        error={selectedImageError}
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={imageActionParams?.action === 'manage-replicas'}
        title={`Manage Replicas for ${selectedImage?.label ?? 'Unknown'}`}
      >
        <ManageImageReplicasForm
          image={selectedImage}
          onClose={handleCloseDialog}
        />
      </Drawer>
      <DeleteImageDialog
        imageId={imageActionParams?.imageId}
        onClose={handleCloseDialog}
        open={imageActionParams?.action === 'delete'}
      />
    </Stack>
  );
};
