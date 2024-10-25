import {
  CircleProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { createLazyRoute } from '@tanstack/react-router';
import { useNavigate, useLocation, useParams } from '@tanstack/react-router';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
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
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useVolumesQuery } from 'src/queries/volumes/volumes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AttachVolumeDrawer } from './AttachVolumeDrawer';
import { CloneVolumeDrawer } from './CloneVolumeDrawer';
import { DeleteVolumeDialog } from './DeleteVolumeDialog';
import { DetachVolumeDialog } from './DetachVolumeDialog';
import { EditVolumeDrawer } from './EditVolumeDrawer';
import { ResizeVolumeDrawer } from './ResizeVolumeDrawer';
import { UpgradeVolumeDialog } from './UpgradeVolumeDialog';
import { VolumeDetailsDrawer } from './VolumeDetailsDrawer';
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';
import { VolumeTableRow } from './VolumeTableRow';

import type { Filter, Volume } from '@linode/api-v4';

const preferenceKey = 'volumes';

export const VolumesLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const pagination = usePagination(1, preferenceKey);
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_volumes',
  });
  const query = location.search.query ?? '';

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

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

  const {
    isBlockStorageEncryptionFeatureEnabled,
  } = useIsBlockStorageEncryptionFeatureEnabled();
  const selectedVolume = volumes?.data.find((v) => v.id === params.volumeId);

  const handleDetach = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'detach' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const handleDelete = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'delete' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const handleDetails = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'details' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const handleEdit = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'edit' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const handleResize = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'resize' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const handleClone = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'clone' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const handleAttach = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'attach' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const handleUpgrade = (volume: Volume) => {
    navigate({
      to: `/volumes/$volumeId/$action`,
      params: { volumeId: volume.id, action: 'upgrade' },
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
    });
  };

  const resetSearch = () => {
    navigate({
      to: '/volumes',
      search: (prev) => ({
        page: prev.page,
        query: undefined,
      }),
    });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({
      to: '/volumes',
      search: (prev) => ({
        page: prev.page,
        query: e.target.value,
      }),
    });
  };

  const navigateToVolumes = () => {
    navigate({
      to: '/volumes',
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
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
        }}
        onChange={debounce(400, (e) => {
          onSearch(e);
        })}
        hideLabel
        label="Search"
        placeholder="Search Volumes"
        sx={{ mb: 2 }}
        value={query}
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
                handleAttach: () => handleAttach(volume),
                handleClone: () => handleClone(volume),
                handleDelete: () => handleDelete(volume),
                handleDetach: () => handleDetach(volume),
                handleDetails: () => handleDetails(volume),
                handleEdit: () => handleEdit(volume),
                handleResize: () => handleResize(volume),
                handleUpgrade: () => handleUpgrade(volume),
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
        onClose={navigateToVolumes}
        open={params.action === 'attach'}
        volume={selectedVolume}
      />
      <VolumeDetailsDrawer
        onClose={navigateToVolumes}
        open={params.action === 'details'}
        volume={selectedVolume}
      />
      <EditVolumeDrawer
        onClose={navigateToVolumes}
        open={params.action === 'edit'}
        volume={selectedVolume}
      />
      <ResizeVolumeDrawer
        onClose={navigateToVolumes}
        open={params.action === 'resize'}
        volume={selectedVolume}
      />
      <CloneVolumeDrawer
        onClose={navigateToVolumes}
        open={params.action === 'clone'}
        volume={selectedVolume}
      />
      <DetachVolumeDialog
        onClose={navigateToVolumes}
        open={params.action === 'detach'}
        volume={selectedVolume}
      />
      <UpgradeVolumeDialog
        onClose={navigateToVolumes}
        open={params.action === 'upgrade'}
        volume={selectedVolume}
      />
      <DeleteVolumeDialog
        onClose={navigateToVolumes}
        open={params.action === 'delete'}
        volume={selectedVolume}
      />
    </>
  );
};

export default VolumesLanding;

export const volumesLandingLazyRoute = createLazyRoute('/')({
  component: VolumesLanding,
});
