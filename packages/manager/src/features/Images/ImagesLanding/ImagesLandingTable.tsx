import { imageQueries, useImageQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { BetaChip, Drawer, Notice, Stack } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { useImagesSubTabs } from '../utils';
import { DeleteImageDialog } from './DeleteImageDialog';
import { EditImageDrawer } from './EditImageDrawer';
import { ManageImageReplicasForm } from './ImageRegions/ManageImageRegionsForm';
import { ImagesCustom } from './ImagesCustom';
import { ImagesRecovery } from './ImagesRecovery';
import { RebuildImageDrawer } from './RebuildImageDrawer';

import type { Handlers as ImageHandlers } from './ImagesActionMenu';
import type { Image } from '@linode/api-v4';
import type { ImageAction } from 'src/routes/images';

export const ImagesLandingTable = () => {
  const navigate = useNavigate();

  const params = useParams({
    from: '/images/images/$imageId/$action',
    shouldThrow: false,
  });

  const search = useSearch({ from: '/images' });
  const { subTabIndex, subTabs } = useImagesSubTabs(search.subType);

  const [manualImagesIsFetching, setManualImagesIsFetching] =
    React.useState(false);
  const [automaticImagesIsFetching, setAutomaticImagesIsFetching] =
    React.useState(false);

  const queryClient = useQueryClient();

  /**
   * At the time of writing: `label`, `tags`, `size`, `status`, `region` are filterable.
   *
   * Some fields like `status` and `region` can't be used in complex filters using '+or' / '+and'
   *
   * Using `tags` in a '+or' is currently broken. See ARB-5792
   */
  const { error: searchParseError, filter } = getAPIFilterFromQuery(
    search.query,
    {
      // Because Images have an array of region objects, we need to transform
      // search queries like "region: us-east" to { regions: { region: "us-east" } }
      // rather than the default behavior which is { region: { '+contains': "us-east" } }
      filterShapeOverrides: {
        '+contains': {
          field: 'region',
          filter: (value) => ({ regions: { region: value } }),
        },
        '+eq': {
          field: 'region',
          filter: (value) => ({ regions: { region: value } }),
        },
      },
      searchableFieldsWithoutOperator: ['label', 'tags'],
    }
  );

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

  const onSearch = (query: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: query || undefined,
      }),
      to: '/images/images',
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

  const isFetching = manualImagesIsFetching || automaticImagesIsFetching;

  const onTabChange = (index: number) => {
    // Update the "subType" query param. (This switches between "My custom images", "Shared with me" and "Recovery images" tabs).
    navigate({
      to: `/images/images`,
      search: (prev) => ({
        ...prev,
        subType: subTabs[index]['key'],
        // Reset pagination and sorting query paramss
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
      <DebouncedSearchTextField
        clearable
        errorText={searchParseError?.message}
        hideLabel
        isSearching={isFetching}
        label="Search"
        onSearch={onSearch}
        placeholder="Search Images"
        value={search.query}
      />
      <Tabs index={subTabIndex} onChange={onTabChange}>
        <TabList>
          {subTabs.map((tab) => (
            <Tab key={`images-${tab.key}`}>
              {tab.title} {tab.isBeta ? <BetaChip /> : null}
            </Tab>
          ))}
        </TabList>
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            {subTabs.map((tab, idx) => (
              <SafeTabPanel index={idx} key={`images-${tab.key}-content`}>
                {tab.key === 'custom' && (
                  <ImagesCustom
                    filter={filter}
                    handlers={handlers}
                    onFetchingChange={setManualImagesIsFetching}
                  />
                )}
                {tab.key === 'shared' && (
                  <Notice variant="info">
                    Share with me is coming soon...
                  </Notice>
                )}
                {tab.key === 'recovery' && (
                  <ImagesRecovery
                    filter={filter}
                    handlers={handlers}
                    onFetchingChange={setAutomaticImagesIsFetching}
                  />
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
