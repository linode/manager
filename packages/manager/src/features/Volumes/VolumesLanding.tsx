import { CircleProgress } from '@linode/ui';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useVolumeQuery, useVolumesQuery } from 'src/queries/volumes/volumes';
import { VOLUME_TABLE_PREFERENCE_KEY } from 'src/routes/volumes/constants';
import {
  VOLUME_TABLE_DEFAULT_ORDER,
  VOLUME_TABLE_DEFAULT_ORDER_BY,
} from 'src/routes/volumes/constants';
import { sendGroupByTagEnabledEvent } from 'src/utilities/analytics/customEventAnalytics';
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

  const { data: volumes, error, isFetching, isLoading } = useVolumesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const { data: selectedVolume, isFetching: isFetchingVolume } = useDialogData({
    enabled: !!params.volumeId,
    paramKey: 'volumeId',
    queryHook: useVolumeQuery,
    redirectToOnNotFound: '/volumes',
  });

  const navigateToVolumes = () => {
    navigate({
      search: (prev) => prev,
      to: '/volumes',
    });
  };

  if (isLoading) {
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

  if (volumes?.results === 0 && !query) {
    return <VolumesLandingEmptyState />;
  }

  return (
    <>
      <VolumesHeader isFetching={isFetching} searchQueryKey={query} />

      <PreferenceToggle
        preferenceKey="volumes_group_by_tag"
        preferenceOptions={[false, true]}
        toggleCallbackFn={sendGroupByAnalytic}
      >
        {({
          preference: volumesAreGrouped,
          togglePreference: toggleGroupVolumes,
        }) => {
          return (
            <VolumesTable
              handleOrderChange={handleOrderChange}
              order={order}
              orderBy={orderBy}
              pagination={pagination}
              toggleGroupVolumes={toggleGroupVolumes}
              volumes={volumes}
              volumesAreGrouped={volumesAreGrouped}
            />
          );
        }}
      </PreferenceToggle>

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
      />
      <ManageTagsDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'manage-tags'}
        volume={selectedVolume}
      />
      <EditVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'edit'}
        volume={selectedVolume}
      />
      <ResizeVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'resize'}
        volume={selectedVolume}
      />
      <CloneVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'clone'}
        volume={selectedVolume}
      />
      <DetachVolumeDialog
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'detach'}
        volume={selectedVolume}
      />
      <UpgradeVolumeDialog
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'upgrade'}
        volume={selectedVolume}
      />
      <DeleteVolumeDialog
        isFetching={isFetchingVolume}
        onClose={navigateToVolumes}
        open={params.action === 'delete'}
        volume={selectedVolume}
      />
    </>
  );
};

const sendGroupByAnalytic = (value: boolean) => {
  sendGroupByTagEnabledEvent('volumes landing', value);
};

export default VolumesLanding;
