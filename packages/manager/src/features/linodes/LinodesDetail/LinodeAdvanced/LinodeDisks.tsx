import { Disk } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import RootRef from 'src/components/core/RootRef';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import { resetEventsPolling } from 'src/eventsPolling';
import ImagesDrawer, { DrawerMode } from 'src/features/Images/ImagesDrawer';
import {
  CreateLinodeDisk,
  DeleteLinodeDisk,
  ResizeLinodeDisk,
  UpdateLinodeDisk,
  withLinodeDetailContext
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import LinodeDiskActionMenu from './LinodeDiskActionMenu';
import LinodeDiskDrawer from './LinodeDiskDrawer';

import Paginate from 'src/components/Paginate';

type ClassNames =
  | 'root'
  | 'headline'
  | 'addNewWrapper'
  | 'loadingContainer'
  | 'tableContainer'
  | 'diskSpaceWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    headline: {
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down('xs')]: {
        marginBottom: 0,
        marginTop: theme.spacing(2)
      }
    },
    addNewWrapper: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
        marginTop: -theme.spacing(1)
      }
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    tableContainer: {
      marginTop: -theme.spacing(2)
    },
    diskSpaceWrapper: {
      backgroundColor: theme.bg.tableHeader,
      border: `1px solid ${theme.color.diskSpaceBorder}`,
      padding: theme.spacing(2),
      minHeight: '250px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  });

interface ConfirmDeleteState {
  open: boolean;
  submitting: boolean;
  errors?: APIError[];
  id?: number;
  label?: string;
}

interface DrawerState {
  open: boolean;
  mode: 'create' | 'rename' | 'resize';
  diskId?: number;
  maximumSize: number;
}

interface ImagizeDrawerState {
  open: boolean;
  description?: string;
  label?: string;
  disk?: Disk;
}

interface State {
  drawer: DrawerState;
  imagizeDrawer: ImagizeDrawerState;
  confirmDelete: ConfirmDeleteState;
}

type CombinedProps = UserSSHKeyProps &
  LinodeContextProps &
  WithStyles<ClassNames> &
  WithSnackbarProps;

const defaultDrawerState: DrawerState = {
  open: false,
  mode: 'create',
  maximumSize: 0
};

const defaultImagizeDrawerState: ImagizeDrawerState = {
  open: false,
  description: '',
  label: '',
  disk: undefined
};

const defaultConfirmDeleteState: ConfirmDeleteState = {
  open: false,
  id: undefined,
  label: undefined,
  submitting: false
};

class LinodeDisks extends React.Component<CombinedProps, State> {
  private disksHeader: React.RefObject<any>;
  constructor(props: CombinedProps) {
    super(props);

    this.disksHeader = React.createRef();

    this.state = {
      drawer: defaultDrawerState,
      imagizeDrawer: defaultImagizeDrawerState,
      confirmDelete: defaultConfirmDeleteState
    };
  }

  errorState = (
    <ErrorState errorText="There was an error loading disk images." />
  );

  render() {
    const { classes, disks, linodeStatus, readOnly } = this.props;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <RootRef rootRef={this.disksHeader}>
            <Grid item>
              <Typography variant="h3" className={classes.headline}>
                Disks
              </Typography>
            </Grid>
          </RootRef>
          <Grid item className={classes.addNewWrapper}>
            <AddNewLink
              onClick={this.openDrawerForCreation}
              label="Add a Disk"
              disabled={readOnly}
            />
          </Grid>
        </Grid>
        <Paginate data={disks} scrollToRef={this.disksHeader}>
          {({
            data: paginatedData,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
            count
          }) => {
            return (
              <React.Fragment>
                <Grid container className={classes.tableContainer}>
                  <Grid item xs={12}>
                    <Table
                      isResponsive={false}
                      aria-label="List of Disks"
                      border
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Label</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.renderTableContent(paginatedData, linodeStatus)}
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
                <PaginationFooter
                  page={page}
                  pageSize={pageSize}
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  eventCategory="linode disks"
                />
              </React.Fragment>
            );
          }}
        </Paginate>
        <this.confirmationDialog />
        <this.drawer />
        <this.imagizeDrawer />
      </React.Fragment>
    );
  }

  renderTableContent = (data: Disk[], status?: string) => {
    const { linodeId, readOnly } = this.props;

    return data.map(disk => (
      <TableRow key={disk.id} data-qa-disk={disk.label}>
        <TableCell>{disk.label}</TableCell>
        <TableCell>{disk.filesystem}</TableCell>
        <TableCell>{disk.size} MB</TableCell>
        <TableCell>
          <LinodeDiskActionMenu
            linodeStatus={status || 'offline'}
            linodeId={linodeId}
            diskId={disk.id}
            label={disk.label}
            onRename={this.openDrawerForRename(disk)}
            onResize={this.openDrawerForResize(disk)}
            onImagize={this.openImagizeDrawer(disk)}
            onDelete={this.openConfirmDelete(disk)}
            readOnly={readOnly}
          />
        </TableCell>
      </TableRow>
    ));
  };

  /**
   * Disk Deletion Confirmation
   */
  setConfirmDelete = (
    obj: Partial<ConfirmDeleteState>,
    fn: () => void = () => null
  ) => {
    const { confirmDelete } = this.state;
    this.setState({ confirmDelete: { ...confirmDelete, ...obj } }, () => {
      fn();
    });
  };

  confirmationDialog = () => {
    const { open, label, errors } = this.state.confirmDelete;

    return (
      <ConfirmationDialog
        onClose={this.closeConfirmDelete}
        title="Confirm Delete"
        open={open}
        actions={this.confirmDeleteActions}
      >
        {errors && <Notice error text={errors[0].reason} />}
        <Typography>Are you sure you want to delete {label}?</Typography>
      </ConfirmationDialog>
    );
  };

  confirmDeleteActions = ({ onClose }: { onClose: () => void }) => {
    const { submitting } = this.state.confirmDelete;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button buttonType="cancel" onClick={onClose} data-qa-cancel-delete>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          destructive
          loading={submitting}
          onClick={this.deleteDisk}
          data-qa-confirm-delete
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  openConfirmDelete = (disk: Disk) => () => {
    this.setConfirmDelete({
      open: true,
      submitting: false,
      errors: undefined,
      id: disk.id,
      label: disk.label
    });
  };

  closeConfirmDelete = () => {
    this.setConfirmDelete({ open: false });
  };

  /**
   * Updates imagize drawer state
   */
  setImagizeDrawer = (
    obj: Partial<ImagizeDrawerState>,
    fn: () => void = () => null
  ) => {
    this.setState(
      { imagizeDrawer: { ...this.state.imagizeDrawer, ...obj } },
      () => {
        fn();
      }
    );
  };

  imagizeDrawer = () => {
    const { open, description, label, disk } = this.state.imagizeDrawer;
    return (
      <ImagesDrawer
        mode={'imagize' as DrawerMode}
        open={open}
        description={description}
        label={label}
        disks={disk ? [disk] : []}
        selectedDisk={disk ? '' + disk.id : null}
        onClose={this.closeImagizeDrawer}
        changeDescription={this.changeImageDescription}
        changeLabel={this.changeImageLabel}
        changeDisk={() => null}
        changeLinode={() => null}
        selectedLinode={null}
      />
    );
  };

  openImagizeDrawer = (disk: Disk) => () => {
    this.setImagizeDrawer({
      ...defaultImagizeDrawerState,
      open: true,
      disk
    });
  };

  closeImagizeDrawer = () => {
    this.setImagizeDrawer({ open: false });
  };

  changeImageDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setImagizeDrawer({
      description: e.target.value
    });
  };

  changeImageLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setImagizeDrawer({
      label: e.target.value
    });
  };

  /**
   * Create/Rename/Resize Drawer
   */
  setDrawer = (obj: Partial<DrawerState>, fn: () => void = () => null) => {
    this.setState({ drawer: { ...this.state.drawer, ...obj } }, () => {
      fn();
    });
  };

  drawer = () => {
    const { diskId, mode, open, maximumSize } = this.state.drawer;
    const { disks } = this.props;

    return (
      <LinodeDiskDrawer
        mode={mode}
        open={open}
        disk={disks.find(thisDisk => thisDisk.id === diskId)}
        maximumSize={maximumSize}
        onClose={this.closeDrawer}
        onSubmit={this.onDrawerSubmit}
        userSSHKeys={this.props.userSSHKeys}
        requestKeys={this.props.requestKeys}
      />
    );
  };

  onDrawerSubmit = (values: any): Promise<any> => {
    switch (this.state.drawer.mode) {
      case 'create':
        return this.createDisk(values);
      case 'rename':
        return this.renameDisk(values.label);
      case 'resize':
        return this.resizeDisk(values.size);
    }
  };

  resizeDisk = (size: number) => {
    const { linodeId, resizeLinodeDisk } = this.props;
    const { diskId } = this.state.drawer;
    if (!linodeId || !diskId) {
      // Safety check; should never happen.
      return Promise.reject({ reason: 'Invalid disk or Linode' });
    }

    return resizeLinodeDisk(diskId, size).then(_ => {
      this.props.enqueueSnackbar(`Disk queued for resizing.`, {
        variant: 'info'
      });
      resetEventsPolling();
    });
  };

  createDisk = (values: any) => {
    const { linodeId, userSSHKeys, createLinodeDisk } = this.props;
    const { label, size, filesystem, image, root_pass } = values;
    if (!linodeId) {
      // Safety check; should never happen.
      return Promise.reject({ reason: 'Invalid Linode' });
    }

    return createLinodeDisk({
      label,
      size,
      filesystem: filesystem === '_none_' ? undefined : filesystem,
      image: Boolean(image) ? image : undefined,
      root_pass: Boolean(root_pass) ? root_pass : undefined,
      authorized_users: userSSHKeys
        ? userSSHKeys.filter(u => u.selected).map(u => u.username)
        : undefined
    });
  };

  renameDisk = (label: string) => {
    const { linodeId, updateLinodeDisk } = this.props;
    const { diskId } = this.state.drawer;
    if (!linodeId || !diskId) {
      // Safety check; should never happen.
      return Promise.reject({ reason: 'Invalid disk or Linode' });
    }
    return updateLinodeDisk(diskId, { label });
  };

  deleteDisk = () => {
    this.setConfirmDelete({ submitting: true, errors: undefined });

    const { linodeId, deleteLinodeDisk } = this.props;
    const { id: diskId } = this.state.confirmDelete;
    if (!linodeId || !diskId) {
      return;
    }

    deleteLinodeDisk(diskId)
      .then(() => {
        this.setConfirmDelete({ open: false, errors: undefined });
      })
      .catch(error => {
        // This error only fires if the request fails;
        // if the deletion hostjob fails, it must be handled through events/Redux.
        const errors = getAPIErrorOrDefault(
          error,
          'There was an error deleting your disk.'
        );
        this.setConfirmDelete({ errors, submitting: false });
      });
  };

  openDrawerForRename = ({ id: diskId }: Disk) => () => {
    this.setDrawer({
      diskId,
      mode: 'rename',
      open: true
    });
  };

  openDrawerForResize = ({ id: diskId, size }: Disk) => () => {
    this.setDrawer({
      diskId,
      maximumSize: Math.max(size, this.calculateDiskFree(diskId)),
      mode: 'resize',
      open: true
    });
  };

  openDrawerForCreation = () => {
    const maximumSize = this.calculateDiskFree(0);

    this.setDrawer({
      diskId: undefined,
      maximumSize,
      mode: 'create',
      open: true
    });
  };

  closeDrawer = () => {
    this.setDrawer({ open: false });
  };

  calculateDiskFree = (diskId: number): number => {
    /**
     * So if there's more than 100 disks, then this count will be off.
     */
    const { linodeTotalDisk, disks } = this.props;
    if (!linodeTotalDisk || !disks) {
      return 0;
    }
    return (
      linodeTotalDisk -
      disks.reduce((acc: number, disk: Disk) => {
        return diskId === disk.id ? acc : acc + disk.size;
      }, 0)
    );
  };
}

const styled = withStyles(styles);

interface LinodeContextProps {
  linodeId?: number;
  linodeStatus?: string;
  linodeTotalDisk?: number;
  deleteLinodeDisk: DeleteLinodeDisk;
  updateLinodeDisk: UpdateLinodeDisk;
  createLinodeDisk: CreateLinodeDisk;
  resizeLinodeDisk: ResizeLinodeDisk;
  readOnly: boolean;
  disks: Disk[];
}

const linodeContext = withLinodeDetailContext(
  ({
    linode,
    deleteLinodeDisk,
    updateLinodeDisk,
    createLinodeDisk,
    resizeLinodeDisk
  }) => ({
    linodeId: linode.id,
    linodeTotalDisk: linode.specs.disk,
    linodeStatus: linode.status,
    deleteLinodeDisk,
    updateLinodeDisk,
    createLinodeDisk,
    resizeLinodeDisk,
    readOnly: linode._permissions === 'read_only',
    disks: linode._disks
  })
);

const enhanced = compose<CombinedProps, {}>(
  styled,
  linodeContext,
  userSSHKeyHoc,
  withSnackbar
);

export default enhanced(LinodeDisks);
