import { Volume } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import AddNewLink from 'src/components/AddNewLink';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { CloneVolumeDrawer } from 'src/features/Volumes/CloneVolumeDrawer';
import { DeleteVolumeDialog } from 'src/features/Volumes/DeleteVolumeDialog';
import { DetachVolumeDialog } from 'src/features/Volumes/DetachVolumeDialog';
import { EditVolumeDrawer } from 'src/features/Volumes/EditVolumeDrawer';
import { ResizeVolumeDrawer } from 'src/features/Volumes/ResizeVolumeDrawer';
import { VolumeDetailsDrawer } from 'src/features/Volumes/VolumeDetailsDrawer';
import { VolumeTableRow } from 'src/features/Volumes/VolumeTableRow';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions';
import { useLinodeVolumesQuery } from 'src/queries/volumes';

import { StyledRootGrid, StyledTypography } from './CommonLinodeStorage.styles';
import { LinodeVolumeAddDrawer } from 'src/features/Volumes/VolumeDrawer/LinodeVolumeAddDrawer';

export const preferenceKey = 'linode-volumes';

export const LinodeVolumes = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  const { data: linode } = useLinodeQuery(id);

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

  const pagination = usePagination(1, preferenceKey);

  const regions = useRegionsQuery().data ?? [];

  const { data, error, isLoading } = useLinodeVolumesQuery(
    id,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const [selectedVolumeId, setSelectedVolumeId] = React.useState<number>();
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isResizeDrawerOpen, setIsResizeDrawerOpen] = React.useState(false);
  const [isCloneDrawerOpen, setIsCloneDrawerOpen] = React.useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [isDetachDialogOpen, setIsDetachDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const selectedVolume = data?.data.find((v) => v.id === selectedVolumeId);

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

  const handleCreateVolume = () => {
    setIsCreateDrawerOpen(true);
  };

  const region = regions.find((thisRegion) => thisRegion.id === linode?.region);

  if (!region?.capabilities.includes('Block Storage')) {
    return null;
  }

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          responsive={{
            3: { xsDown: true },
          }}
          columns={5}
          rows={1}
        />
      );
    } else if (error) {
      return <TableRowError colSpan={6} message={error[0].reason} />;
    } else if (data?.results === 0) {
      return <TableRowEmpty colSpan={5} message="No Volumes to display." />;
    } else if (data) {
      return data.data.map((volume) => {
        return (
          <VolumeTableRow
            handlers={{
              handleAttach: () => null,
              handleClone: () => handleClone(volume),
              handleDelete: () => handleDelete(volume),
              handleDetach: () => handleDetach(volume),
              handleDetails: () => handleDetails(volume),
              handleEdit: () => handleEdit(volume),
              handleResize: () => handleResize(volume),
            }}
            isDetailsPageRow
            key={volume.id}
            volume={volume}
          />
        );
      });
    }

    return null;
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <StyledRootGrid
        alignItems="flex-end"
        container
        justifyContent="space-between"
        spacing={1}
      >
        <Grid className="p0">
          <StyledTypography variant="h3">Volumes</StyledTypography>
        </Grid>
        <StyledNewWrapperGrid>
          <AddNewLink
            disabled={false}
            label="Create Volume"
            onClick={handleCreateVolume}
          />
        </StyledNewWrapperGrid>
      </StyledRootGrid>
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
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              handleClick={handleOrderChange}
              label="size"
            >
              Size
            </TableSortCell>
            <Hidden xsDown>
              <TableCell>File System Path</TableCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="Volumes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      {linode && (
        <LinodeVolumeAddDrawer
          linode={linode}
          onClose={() => setIsCreateDrawerOpen(false)}
          open={isCreateDrawerOpen}
        />
      )}
      <VolumeDetailsDrawer
        onClose={() => setIsDetailsDrawerOpen(false)}
        open={isDetailsDrawerOpen}
        volume={selectedVolume}
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
    </div>
  );
};

const StyledNewWrapperGrid = styled(Grid, { label: 'StyledNewWrapperGrid' })(
  ({ theme }) => ({
    '&.MuiGrid-item': {
      padding: 5,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: `-${theme.spacing(1.5)}`,
      marginTop: `-${theme.spacing(1)}`,
    },
  })
);
