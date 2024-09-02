import {
  useGroupedVolumesQuery,
  useMutatePreferences,
  usePreferences,
  useVolumeQuery,
  useVolumesQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  VOLUME_TABLE_DEFAULT_ORDER,
  VOLUME_TABLE_DEFAULT_ORDER_BY,
} from 'src/routes/volumes/constants';
import { VOLUME_TABLE_PREFERENCE_KEY } from 'src/routes/volumes/constants';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { DeleteVolumeDialog } from './Dialogs/DeleteVolumeDialog';
import { DetachVolumeDialog } from './Dialogs/DetachVolumeDialog';
import { UpgradeVolumeDialog } from './Dialogs/UpgradeVolumeDialog';
import { AttachVolumeDrawer } from './Drawers/AttachVolumeDrawer';
import { CloneVolumeDrawer } from './Drawers/CloneVolumeDrawer';
import { EditVolumeDrawer } from './Drawers/EditVolumeDrawer';
import { ManageTagsDrawer } from './Drawers/ManageTagsDrawer';
import { ResizeVolumeDrawer } from './Drawers/ResizeVolumeDrawer';
import { VolumeDetailsDrawer } from './Drawers/VolumeDetailsDrawer';
import { VolumesHeader } from './VolumesHeader';
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';
import { VolumesTable } from './VolumesTable';

import type { Filter } from '@linode/api-v4';
import type { VolumesSearchParams } from 'src/routes/volumes/index';

export const VolumesLanding = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const search: VolumesSearchParams = useSearch({
    from: '/volumes',
  });
  const pagination = usePaginationV2({
    currentRoute: '/volumes',
    preferenceKey: VOLUME_TABLE_PREFERENCE_KEY,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });

  const { data: groupedByTags } = usePreferences(
    (preferences) => preferences?.volumes_group_by_tag
  );

  const { mutateAsync: updateUserPreferences } = useMutatePreferences();

  const { query } = search;

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: VOLUME_TABLE_DEFAULT_ORDER,
        orderBy: VOLUME_TABLE_DEFAULT_ORDER_BY,
      },
      from: '/volumes',
    },
    preferenceKey: VOLUME_TABLE_PREFERENCE_KEY,
  });

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...(query && {
      label: { '+contains': query },
    }),
  };

  const {
    data: volumes,
    error,
    isFetching,
    isLoading,
  } = useVolumesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const {
    data: groupedVolumes,
    error: groupedError,
    isFetching: groupedIsFetching,
    isLoading: groupedIsLoading,
  } = useGroupedVolumesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const {
    data: selectedVolume,
    isFetching: isFetchingVolume,
    error: selectedVolumeError,
  } = useVolumeQuery(Number(params.volumeId), !!params.volumeId);

  const navigateToVolumes = () => {
    navigate({
      search: (prev) => prev,
      to: '/volumes',
    });
  };

  if (isLoading || groupedIsLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your volumes.')[0].reason
        }
      />
    );
  }

  if (groupedError) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(groupedError, 'Error loading your volumes.')[0]
            .reason
        }
      />
    );
  }

  if (volumes?.results === 0 && !query) {
    return <VolumesLandingEmptyState />;
  }

  return (
    <>
      <VolumesHeader
        isFetching={groupedByTags ? groupedIsFetching : isFetching}
        searchQueryKey={query}
      />

      <VolumesTable
        groupedByTags={!!groupedByTags}
        handleOrderChange={handleOrderChange}
        order={order}
        orderBy={orderBy}
        pagination={pagination}
        updateUserPreferences={updateUserPreferences}
        volumes={groupedByTags ? groupedVolumes : volumes}
      />

      <PaginationFooter
        count={volumes?.results ?? 0}
        eventCategory="Volumes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />

      <AttachVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'attach'}
        volume={selectedVolume}
      />
      <VolumeDetailsDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'details'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <ManageTagsDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'manage-tags'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <EditVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'edit'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <ResizeVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'resize'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <CloneVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'clone'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <DetachVolumeDialog
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'detach'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <UpgradeVolumeDialog
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'upgrade'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <DeleteVolumeDialog
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'delete'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
    </>
  );
};
