import { getAPIFilterFromQuery } from '@linode/search';
import CloseIcon from '@mui/icons-material/Close';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { IconButton } from 'src/components/IconButton';
import { InputAdornment } from 'src/components/InputAdornment';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
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

import type { Volume } from '@linode/api-v4';

const preferenceKey = 'volumes';
const searchQueryKey = 'query';

export const VolumesLanding = () => {
  const history = useHistory();
  const location = useLocation<{ volume: Volume | undefined }>();
  const pagination = usePagination(1, preferenceKey);
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get(searchQueryKey) ?? '';

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  let filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    error: parseError,
    filter: searchFilter,
  } = getAPIFilterFromQuery(query, { defaultSearchKeys: ['label', 'tags'] });

  if (query) {
    filter = { ...filter, ...searchFilter };
  }

  const { data: volumes, error, isFetching, isLoading } = useVolumesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );
  const [selectedVolumeId, setSelectedVolumeId] = React.useState<number>();
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = React.useState(
    Boolean(location.state?.volume)
  );
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isResizeDrawerOpen, setIsResizeDrawerOpen] = React.useState(false);
  const [isCloneDrawerOpen, setIsCloneDrawerOpen] = React.useState(false);
  const [isAttachDrawerOpen, setIsAttachDrawerOpen] = React.useState(false);
  const [isDetachDialogOpen, setIsDetachDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = React.useState(false);

  const selectedVolume = volumes?.data.find((v) => v.id === selectedVolumeId);

  const handleDetach = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsDetachDialogOpen(true);
  };

  const handleDelete = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsDeleteDialogOpen(true);
  };

  const handleDetails = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsDetailsDrawerOpen(true);
  };

  const handleEdit = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsEditDrawerOpen(true);
  };

  const handleResize = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsResizeDrawerOpen(true);
  };

  const handleClone = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsCloneDrawerOpen(true);
  };

  const handleAttach = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsAttachDrawerOpen(true);
  };

  const handleUpgrade = (volume: Volume) => {
    setSelectedVolumeId(volume.id);
    setIsUpgradeDialogOpen(true);
  };

  const resetSearch = () => {
    queryParams.delete(searchQueryKey);
    history.push({ search: queryParams.toString() });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    queryParams.delete('page');
    queryParams.set(searchQueryKey, e.target.value);
    history.push({ search: queryParams.toString() });
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error && !query) {
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
          pathname: location.pathname,
          removeCrumbX: 1,
        }}
        docsLink="https://www.linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode/"
        entity="Volume"
        onButtonClick={() => history.push('/volumes/create')}
        title="Volumes"
      />
      <TextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress size="sm" />}
              {parseError && (
                <TooltipIcon status="error" text={parseError.message} />
              )}
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
            <TableCell>ID</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={7} message={error[0].reason} />}
          {volumes?.data.length === 0 && (
            <TableRowEmpty colSpan={7} message="No volume found" />
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
        onClose={() => setIsAttachDrawerOpen(false)}
        open={isAttachDrawerOpen}
        volume={selectedVolume}
      />
      <VolumeDetailsDrawer
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          if (location.state?.volume) {
            window.history.replaceState(null, '');
          }
        }}
        open={isDetailsDrawerOpen}
        volume={selectedVolume ?? location.state?.volume}
      />
      <EditVolumeDrawer
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
        volume={selectedVolume}
      />
      <ResizeVolumeDrawer
        onClose={() => setIsResizeDrawerOpen(false)}
        open={isResizeDrawerOpen}
        volume={selectedVolume}
      />
      <CloneVolumeDrawer
        onClose={() => setIsCloneDrawerOpen(false)}
        open={isCloneDrawerOpen}
        volume={selectedVolume}
      />
      <DetachVolumeDialog
        onClose={() => setIsDetachDialogOpen(false)}
        open={isDetachDialogOpen}
        volume={selectedVolume}
      />
      <UpgradeVolumeDialog
        onClose={() => setIsUpgradeDialogOpen(false)}
        open={isUpgradeDialogOpen}
        volume={selectedVolume}
      />
      <DeleteVolumeDialog
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        volume={selectedVolume}
      />
    </>
  );
};

export default VolumesLanding;
