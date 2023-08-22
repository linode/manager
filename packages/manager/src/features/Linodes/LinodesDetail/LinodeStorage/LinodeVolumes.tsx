import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dispatch, bindActionCreators } from 'redux';

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
import { DestructiveVolumeDialog } from 'src/features/Volumes/DestructiveVolumeDialog';
import { VolumeAttachmentDrawer } from 'src/features/Volumes/VolumeAttachmentDrawer';
import { VolumeTableRow } from 'src/features/Volumes/VolumeTableRow';
import { ActionHandlers as VolumeHandlers } from 'src/features/Volumes/VolumesActionMenu';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
import {
  LinodeOptions,
  Origin as VolumeDrawerOrigin,
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize,
} from 'src/store/volumeForm';

import { StyledRootGrid, StyledTypography } from './CommonLinodeStorage.styles';

interface DispatchProps {
  openForClone: (
    volumeId: number,
    volumeLabel: string,
    volumeSize: number,
    volumeRegion: string
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  openForCreating: (
    origin: VolumeDrawerOrigin,
    linodeOptions?: LinodeOptions
  ) => void;
  openForEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[]
  ) => void;
  openForResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string,
    volumeRegion: string
  ) => void;
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      openForClone,
      openForConfig,
      openForCreating,
      openForEdit,
      openForResize,
    },
    dispatch
  );

const connected = connect(undefined, mapDispatchToProps);

type Props = DispatchProps;

export const preferenceKey = 'linode-volumes';

export const LinodeVolumes = connected((props: Props) => {
  const {
    openForClone,
    openForConfig,
    openForCreating,
    openForEdit,
    openForResize,
  } = props;

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

  const [attachmentDrawer, setAttachmentDrawer] = React.useState({
    linodeRegion: '',
    open: false,
    volumeId: 0,
    volumeLabel: '',
  });

  const [destructiveDialog, setDestructiveDialog] = React.useState<{
    linodeLabel: string;
    mode: 'delete' | 'detach';
    open: boolean;
    volumeId?: number;
    volumeLabel: string;
  }>({
    linodeLabel: '',
    mode: 'detach',
    open: false,
    volumeId: 0,
    volumeLabel: '',
  });

  const handleCloseAttachDrawer = () => {
    setAttachmentDrawer((attachmentDrawer) => ({
      ...attachmentDrawer,
      open: false,
    }));
  };

  const handleAttach = (volumeId: number, label: string, regionID: string) => {
    setAttachmentDrawer((attachmentDrawer) => ({
      ...attachmentDrawer,
      linodeRegion: regionID,
      open: true,
      volumeId,
      volumeLabel: label,
    }));
  };

  const handleDetach = (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    linodeId: number
  ) => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      error: '',
      linodeId,
      linodeLabel,
      mode: 'detach',
      open: true,
      volumeId,
      volumeLabel,
    }));
  };

  const handleDelete = (volumeId: number, volumeLabel: string) => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      error: '',
      linodeLabel: '',
      mode: 'delete',
      open: true,
      volumeId,
      volumeLabel,
    }));
  };

  const closeDestructiveDialog = () => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      open: false,
    }));
  };

  const openCreateVolumeDrawer = (e: any) => {
    e.preventDefault();

    if (linode) {
      return openForCreating('Created from Linode Details', {
        linodeId: linode.id,
        linodeLabel: linode.label,
        linodeRegion: linode.region,
      });
    }
  };

  const region = regions.find((thisRegion) => thisRegion.id === linode?.region);

  if (!region?.capabilities.includes('Block Storage')) {
    return null;
  }

  const handlers: VolumeHandlers = {
    handleAttach,
    handleDelete,
    handleDetach,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
  };

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
      return data.data.map((volume) => (
        <VolumeTableRow
          key={volume.id}
          {...volume}
          {...handlers}
          isDetailsPageRow
        />
      ));
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
            onClick={openCreateVolumeDrawer}
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
      <VolumeAttachmentDrawer
        linodeRegion={attachmentDrawer.linodeRegion || ''}
        onClose={handleCloseAttachDrawer}
        open={attachmentDrawer.open}
        volumeId={attachmentDrawer.volumeId || 0}
        volumeLabel={attachmentDrawer.volumeLabel || ''}
      />
      <DestructiveVolumeDialog
        linodeId={id}
        linodeLabel={destructiveDialog.linodeLabel}
        mode={destructiveDialog.mode}
        onClose={closeDestructiveDialog}
        open={destructiveDialog.open}
        volumeId={destructiveDialog.volumeId ?? 0}
        volumeLabel={destructiveDialog.volumeLabel}
      />
    </div>
  );
});

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
