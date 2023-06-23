import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { DestructiveVolumeDialog } from 'src/features/Volumes/DestructiveVolumeDialog';
import { VolumeAttachmentDrawer } from 'src/features/Volumes/VolumeAttachmentDrawer';
import { ActionHandlers as VolumeHandlers } from 'src/features/Volumes/VolumesActionMenu';
import { VolumeTableRow } from 'src/features/Volumes/VolumeTableRow';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRegionsQuery } from 'src/queries/regions';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
import { useParams } from 'react-router-dom';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  LinodeOptions,
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize,
  Origin as VolumeDrawerOrigin,
} from 'src/store/volumeForm';

const useStyles = makeStyles((theme: Theme) => ({
  addNewWrapper: {
    '&.MuiGrid-item': {
      padding: 5,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: `-${theme.spacing(1.5)}`,
      marginTop: `-${theme.spacing(1)}`,
    },
  },
  headline: {
    lineHeight: '1.5rem',
    marginBottom: 8,
    marginLeft: 15,
    marginTop: 8,
  },
  root: {
    backgroundColor: theme.color.white,
    margin: 0,
    width: '100%',
  },
  volumesPanel: {
    marginTop: '20px',
  },
}));

interface DispatchProps {
  openForEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[]
  ) => void;
  openForResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string
  ) => void;
  openForClone: (
    volumeId: number,
    volumeLabel: string,
    volumeSize: number,
    volumeRegion: string
  ) => void;
  openForCreating: (
    origin: VolumeDrawerOrigin,
    linodeOptions?: LinodeOptions
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
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

  const classes = useStyles();

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
    open: boolean;
    mode: 'detach' | 'delete';
    volumeId?: number;
    volumeLabel: string;
    linodeLabel: string;
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
          rows={1}
          columns={5}
          responsive={{
            3: { xsDown: true },
          }}
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
    <div className={classes.volumesPanel}>
      <Grid
        container
        justifyContent="space-between"
        alignItems="flex-end"
        className={classes.root}
        spacing={1}
      >
        <Grid className="p0">
          <Typography variant="h3" className={classes.headline}>
            Volumes
          </Typography>
        </Grid>
        <Grid className={classes.addNewWrapper}>
          <AddNewLink
            onClick={openCreateVolumeDrawer}
            label="Create Volume"
            disabled={false}
          />
        </Grid>
      </Grid>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              label="label"
              handleClick={handleOrderChange}
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
            >
              Status
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              label="size"
              handleClick={handleOrderChange}
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
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="Volumes Table"
      />
      <VolumeAttachmentDrawer
        open={attachmentDrawer.open}
        volumeId={attachmentDrawer.volumeId || 0}
        volumeLabel={attachmentDrawer.volumeLabel || ''}
        linodeRegion={attachmentDrawer.linodeRegion || ''}
        onClose={handleCloseAttachDrawer}
      />
      <DestructiveVolumeDialog
        open={destructiveDialog.open}
        volumeLabel={destructiveDialog.volumeLabel}
        linodeLabel={destructiveDialog.linodeLabel}
        linodeId={id}
        volumeId={destructiveDialog.volumeId ?? 0}
        mode={destructiveDialog.mode}
        onClose={closeDestructiveDialog}
      />
    </div>
  );
});
