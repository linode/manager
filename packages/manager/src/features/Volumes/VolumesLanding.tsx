import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { LandingLoading } from 'src/components/LandingLoading/LandingLoading';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useVolumesQuery } from 'src/queries/volumes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AttachVolumeDrawer } from './AttachVolumeDrawer';
import { CloneVolumeDrawer } from './CloneVolumeDrawer';
import { DeleteVolumeDialog } from './DeleteVolumeDialog';
import { DetachVolumeDialog } from './DetachVolumeDialog';
import { EditVolumeDrawer } from './EditVolumeDrawer';
import { ResizeVolumeDrawer } from './ResizeVolumeDrawer';
import { VolumeDetailsDrawer } from './VolumeDetailsDrawer';
import { VolumeTableRow } from './VolumeTableRow';
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';

import type { Volume } from '@linode/api-v4';

const preferenceKey = 'volumes';

export const VolumesLanding = () => {
  const history = useHistory();

  const location = useLocation<{ volume: Volume | undefined }>();

  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data: volumes, error, isLoading } = useVolumesQuery(
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

  if (isLoading) {
    return <LandingLoading />;
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

  if (volumes?.results === 0) {
    return <VolumesLandingEmptyState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Volumes" />
      <LandingHeader
        docsLink="https://www.linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode/"
        entity="Volume"
        onButtonClick={() => history.push('/volumes/create')}
        title="Volumes"
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
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
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
      <DeleteVolumeDialog
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        volume={selectedVolume}
      />
    </>
  );
};

export default VolumesLanding;
