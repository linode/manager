import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import AddNewLink from 'src/components/AddNewLink';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter/PaginationFooter';
import Table from 'src/components/Table/Table';
import TableCell from 'src/components/TableCell/TableCell';
import TableRow from 'src/components/TableRow/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { DestructiveVolumeDialog } from 'src/features/Volumes/DestructiveVolumeDialog';
import { VolumeAttachmentDrawer } from 'src/features/Volumes/VolumeAttachmentDrawer';
import { ActionHandlers as VolumeHandlers } from 'src/features/Volumes/VolumesActionMenu';
import VolumeTableRow from 'src/features/Volumes/VolumeTableRow';
import { useOrder } from 'src/hooks/useOrder';
import usePagination from 'src/hooks/usePagination';
import { useRegionsQuery } from 'src/queries/regions';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
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
  root: {
    backgroundColor: theme.color.white,
    margin: 0,
    width: '100%',
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem',
  },
  addNewWrapper: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: `-${theme.spacing(1.5)}`,
      marginTop: `-${theme.spacing(1)}`,
    },
    '&.MuiGrid-item': {
      padding: 5,
    },
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

type CombinedProps = LinodeContextProps & DispatchProps;

export const preferenceKey = 'linode-volumes';

export const LinodeVolumes: React.FC<CombinedProps> = (props) => {
  const {
    openForConfig,
    openForClone,
    openForEdit,
    openForResize,
    openForCreating,
    linodeId,
    linodeLabel,
    linodeRegion,
  } = props;

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'desc',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const pagination = usePagination(1, preferenceKey);

  const classes = useStyles();

  const regions = useRegionsQuery().data ?? [];
  const { data, isLoading, error } = useLinodeVolumesQuery(
    linodeId ?? 0,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const [attachmentDrawer, setAttachmentDrawer] = React.useState({
    open: false,
    volumeId: 0,
    volumeLabel: '',
    linodeRegion: '',
  });

  const [destructiveDialog, setDestructiveDialog] = React.useState<{
    open: boolean;
    mode: 'detach' | 'delete';
    volumeId?: number;
    volumeLabel: string;
    linodeLabel: string;
  }>({
    open: false,
    mode: 'detach',
    volumeId: 0,
    volumeLabel: '',
    linodeLabel: '',
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
      open: true,
      volumeId,
      volumeLabel: label,
      linodeRegion: regionID,
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
      open: true,
      mode: 'detach',
      volumeId,
      volumeLabel,
      linodeLabel,
      linodeId,
      error: '',
    }));
  };

  const handleDelete = (volumeId: number, volumeLabel: string) => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      open: true,
      mode: 'delete',
      volumeId,
      volumeLabel,
      linodeLabel: '',
      error: '',
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

    if (linodeId && linodeLabel && linodeRegion) {
      return openForCreating('Created from Linode Details', {
        linodeId,
        linodeLabel,
        linodeRegion,
      });
    }
  };

  const currentRegion = regions.find(
    (thisRegion) => thisRegion.id === linodeRegion
  );

  if (!currentRegion || !currentRegion.capabilities.includes('Block Storage')) {
    return null;
  }

  const handlers: VolumeHandlers = {
    openForConfig,
    openForEdit,
    openForResize,
    openForClone,
    handleAttach,
    handleDetach,
    handleDelete,
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
      return (
        <TableRowEmptyState colSpan={5} message="No Volumes to display." />
      );
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
      >
        <Grid item className="p0">
          <Typography variant="h3" className={classes.headline}>
            Volumes
          </Typography>
        </Grid>
        <Grid item className={classes.addNewWrapper}>
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
              label="Status"
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
        linodeId={linodeId ?? 0}
        volumeId={destructiveDialog.volumeId ?? 0}
        mode={destructiveDialog.mode}
        onClose={closeDestructiveDialog}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      openForEdit,
      openForResize,
      openForClone,
      openForCreating,
      openForConfig,
    },
    dispatch
  );

interface LinodeContextProps {
  linodeId?: number;
  linodeStatus?: string;
  linodeLabel?: string;
  linodeRegion?: string;
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  linodeStatus: linode.status,
  linodeLabel: linode.label,
  linodeRegion: linode.region,
  readOnly: linode._permissions === 'read_only',
}));

const connected = connect(undefined, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  connected,
  linodeContext
)(LinodeVolumes);
