import { useVolumeQuery, useVolumesQuery } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
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
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';
import { VolumeTableRow } from './VolumeTableRow';

import type { Filter, Volume } from '@linode/api-v4';
import type {
  VolumeAction,
  VolumesSearchParams,
} from 'src/routes/volumes/index';

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
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_volumes',
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

  const { isBlockStorageEncryptionFeatureEnabled } =
    useIsBlockStorageEncryptionFeatureEnabled();

  const { data: selectedVolume, isFetching: isFetchingVolume } = useDialogData({
    enabled: !!params.volumeId,
    paramKey: 'volumeId',
    queryHook: useVolumeQuery,
    redirectToOnNotFound: '/volumes',
  });

  const handleVolumeAction = (action: VolumeAction, volume: Volume) => {
    navigate({
      params: { action, volumeId: volume.id },
      search: (prev) => prev,
      to: `/volumes/$volumeId/$action`,
    });
  };

  const resetSearch = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        query: undefined,
      }),
      to: '/volumes',
    });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: e.target.value || undefined,
      }),
      to: '/volumes',
    });
  };

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
      <DocumentTitleSegment segment="Volumes" />
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Volumes',
          removeCrumbX: 1,
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Volumes',
          }),
        }}
        disabledCreateButton={isRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/block-storage"
        entity="Volume"
        onButtonClick={() => navigate({ to: '/volumes/create' })}
        title="Volumes"
      />
      <TextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress size="sm" />}

              <IconButton
                aria-label="Clear"
                data-testid="clear-volumes-search"
                onClick={resetSearch}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
          sx: { mb: 2 },
        }}
        onChange={debounce(400, (e) => {
          onSearch(e);
        })}
        hideLabel
        label="Search"
        placeholder="Search Volumes"
        value={query ?? ''}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <TableCell>Region</TableCell>
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              handleClick={handleOrderChange}
              label="size"
            >
              Size
            </TableSortCell>
            <TableCell>Attached To</TableCell>
            {isBlockStorageEncryptionFeatureEnabled && (
              <TableCell>Encryption</TableCell>
            )}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {volumes?.data.length === 0 && (
            <TableRowEmpty colSpan={6} message="No volume found" />
          )}
          {volumes?.data.map((volume) => (
            <VolumeTableRow
              handlers={{
                handleAttach: () => handleVolumeAction('attach', volume),
                handleClone: () => handleVolumeAction('clone', volume),
                handleDelete: () => handleVolumeAction('delete', volume),
                handleDetach: () => handleVolumeAction('detach', volume),
                handleDetails: () => handleVolumeAction('details', volume),
                handleEdit: () => handleVolumeAction('edit', volume),
                handleManageTags: () =>
                  handleVolumeAction('manage-tags', volume),
                handleResize: () => handleVolumeAction('resize', volume),
                handleUpgrade: () => handleVolumeAction('upgrade', volume),
              }}
              isBlockStorageEncryptionFeatureEnabled={
                isBlockStorageEncryptionFeatureEnabled
              }
              key={volume.id}
              volume={volume}
            />
          ))}
        </TableBody>
      </Table>
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
