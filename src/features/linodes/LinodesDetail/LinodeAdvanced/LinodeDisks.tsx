import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { path, pathEq, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { Subscription } from 'rxjs/Subscription';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
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
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { events$, resetEventsPolling } from 'src/events';
import ImagesDrawer, { modes } from 'src/features/Images/ImagesDrawer';
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
import { getLinodeDisks } from 'src/services/linodes';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import LinodeDiskActionMenu from './LinodeDiskActionMenu';
import LinodeDiskDrawer from './LinodeDiskDrawer';
import LinodeDiskSpace from './LinodeDiskSpace';

type ClassNames =
  | 'root'
  | 'headline'
  | 'loadingContainer'
  | 'tableContainer'
  | 'diskSpaceWrapper';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  headline: {
    marginBottom: theme.spacing.unit * 2
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableContainer: {
    marginTop: -theme.spacing.unit * 2
  },
  diskSpaceWrapper: {
    backgroundColor: theme.bg.tableHeader,
    border: `1px solid ${theme.color.diskSpaceBorder}`,
    padding: theme.spacing.unit * 2,
    minHeight: '250px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
});

type Filesystem = 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd' | '_none_';

interface ConfirmDeleteState {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  id?: number;
  label?: string;
}

interface DrawerState {
  open: boolean;
  submitting: boolean;
  mode: 'create' | 'rename' | 'resize';
  errors?: Linode.ApiFieldError[];
  diskId?: number;
  maximumSize: number;
  fields: {
    label: string;
    filesystem: Filesystem;
    size: number;
    image?: string;
    password?: string;
  };
}

interface ImagizeDrawerState {
  open: boolean;
  description?: string;
  label?: string;
  disk?: Linode.Disk;
}

interface State {
  drawer: DrawerState;
  imagizeDrawer: ImagizeDrawerState;
  confirmDelete: ConfirmDeleteState;
}

type CombinedProps = UserSSHKeyProps &
  PaginationProps<Linode.Disk> &
  LinodeContextProps &
  WithStyles<ClassNames> &
  InjectedNotistackProps;

class LinodeDisks extends React.Component<CombinedProps, State> {
  static defaultDrawerState: DrawerState = {
    open: false,
    submitting: false,
    mode: 'create',
    errors: undefined,
    maximumSize: 0,
    fields: {
      label: '',
      filesystem: 'ext4',
      size: 0
    }
  };

  static defaultImagizeDrawerState: ImagizeDrawerState = {
    open: false,
    description: '',
    label: '',
    disk: undefined
  };

  static defaultConfirmDeleteState: ConfirmDeleteState = {
    open: false,
    id: undefined,
    label: undefined,
    submitting: false
  };

  state: State = {
    drawer: LinodeDisks.defaultDrawerState,
    imagizeDrawer: LinodeDisks.defaultImagizeDrawerState,
    confirmDelete: LinodeDisks.defaultConfirmDeleteState
  };

  eventsSubscription: Subscription;

  componentDidMount() {
    const { linodeId } = this.props;

    this.eventsSubscription = events$
      .filter(e => !e._initial)
      .filter(pathEq(['entity', 'id'], linodeId))
      .filter(
        e =>
          e.status === 'finished' &&
          ['disk_resize', 'disk_delete'].includes(e.action)
      )
      .subscribe(e => this.props.request());
  }

  componentDidUpdate() {
    const disks = path(['data'], this.props);
    if (!disks) {
      this.props.handleOrderChange('label');
    }
  }

  componentWillUnmount() {
    if (this.eventsSubscription.unsubscribe) {
      this.eventsSubscription.unsubscribe();
    }
  }

  errorState = (
    <ErrorState errorText="There was an error loading disk images." />
  );

  render() {
    const {
      classes,
      data,
      error,
      loading,
      linodeStatus,
      linodeTotalDisk,
      readOnly
    } = this.props;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography variant="h3" className={classes.headline}>
              Disks
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openDrawerForCreation}
              label="Add a Disk"
              disabled={readOnly}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.tableContainer}>
          <Grid item xs={12} md={8} sm={12}>
            <Table isResponsive={false} aria-label="List of Disks" border>
              <TableHead>
                <TableRow>
                  <TableCell>Label</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {this.renderTableContent(loading, linodeStatus, error, data)}
              </TableBody>
            </Table>
          </Grid>
          <Grid item xs={12} md={4} sm={12}>
            <Paper classes={{ root: classes.diskSpaceWrapper }}>
              <LinodeDiskSpace
                disks={data}
                error={error}
                loading={loading}
                totalDiskSpace={linodeTotalDisk}
              />
            </Paper>
          </Grid>
        </Grid>
        <PaginationFooter
          page={this.props.page}
          pageSize={this.props.pageSize}
          count={this.props.count}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
          eventCategory="linode disks"
        />
        <this.confirmationDialog />
        <this.drawer />
        <this.imagizeDrawer />
      </React.Fragment>
    );
  }

  renderTableContent = (
    loading: boolean,
    status?: string,
    error?: Error,
    data?: Linode.Disk[]
  ) => {
    const { readOnly } = this.props;
    if (loading) {
      return <TableRowLoading colSpan={3} />;
    }

    if (error) {
      return (
        <TableRowError colSpan={3} message={`Unable to load Linode disks`} />
      );
    }

    if (!data || data.length === 0) {
      return <TableRowEmptyState colSpan={3} />;
    }

    return data.map(disk => (
      <TableRow key={disk.id} data-qa-disk={disk.label}>
        <TableCell>{disk.label}</TableCell>
        <TableCell>{disk.filesystem}</TableCell>
        <TableCell>{disk.size} MB</TableCell>
        <TableCell>
          <LinodeDiskActionMenu
            linodeStatus={status || 'offline'}
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
        <Typography>Are you sure you want to delete "{label}"</Typography>
      </ConfirmationDialog>
    );
  };

  confirmDeleteActions = ({ onClose }: { onClose: () => void }) => {
    const { submitting } = this.state.confirmDelete;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button type="cancel" onClick={onClose} data-qa-cancel-delete>
          Cancel
        </Button>
        <Button
          type="secondary"
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

  openConfirmDelete = (disk: Linode.Disk) => () => {
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
        mode={modes.IMAGIZING}
        open={open}
        description={description}
        label={label}
        disks={disk ? [disk] : []}
        selectedDisk={disk && '' + disk.id}
        onClose={this.closeImagizeDrawer}
        changeDescription={this.changeImageDescription}
        changeLabel={this.changeImageLabel}
      />
    );
  };

  openImagizeDrawer = (disk: Linode.Disk) => () => {
    this.setImagizeDrawer({
      ...LinodeDisks.defaultImagizeDrawerState,
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
    const {
      mode,
      open,
      errors,
      submitting,
      maximumSize,
      fields: { label, size, filesystem, password } // Image is handled internally by React Select
    } = this.state.drawer;

    return (
      <LinodeDiskDrawer
        submitting={submitting}
        mode={mode}
        open={open}
        errors={errors}
        label={label}
        filesystem={filesystem}
        size={size}
        password={password}
        maximumSize={maximumSize}
        onLabelChange={this.onLabelChange}
        onSizeChange={this.onSizeChange}
        onFilesystemChange={this.onFilesystemChange}
        onClose={this.closeDrawer}
        onSubmit={this.onDrawerSubmit}
        onImageChange={this.onImageChange}
        onPasswordChange={this.onPasswordChange}
        onResetImageMode={this.onResetImageMode}
        userSSHKeys={this.props.userSSHKeys}
      />
    );
  };

  onLabelChange = (label: string) => {
    const { fields } = this.state.drawer;
    this.setDrawer({ fields: { ...fields, label } });
  };

  onSizeChange = (size: number) => {
    const { fields } = this.state.drawer;
    this.setDrawer({ fields: { ...fields, size } });
  };

  onFilesystemChange = (filesystem: Filesystem) => {
    const { fields } = this.state.drawer;
    this.setDrawer({ fields: { ...fields, filesystem } });
  };

  onImageChange = (image: string | undefined) => {
    const { fields } = this.state.drawer;
    this.setDrawer({ fields: { ...fields, image } });
  };

  onPasswordChange = (password: string) => {
    const { fields } = this.state.drawer;
    this.setDrawer({ fields: { ...fields, password } });
  };

  onResetImageMode = () => {
    const { fields } = this.state.drawer;
    this.setDrawer({
      fields: { ...fields, image: undefined, password: undefined }
    });
  };

  onDrawerSubmit = () => {
    switch (this.state.drawer.mode) {
      case 'create':
        return this.createDisk();
      case 'rename':
        return this.renameDisk();
      case 'resize':
        return this.resizeDisk();
    }
  };

  resizeDisk = () => {
    const { linodeId, resizeLinodeDisk } = this.props;
    const {
      diskId,
      fields: { size }
    } = this.state.drawer;
    if (!linodeId || !diskId) {
      return;
    }

    this.setDrawer({ submitting: true, errors: undefined });

    resizeLinodeDisk(diskId, size)
      .then(data => {
        this.setDrawer(LinodeDisks.defaultDrawerState);
        this.props.enqueueSnackbar(`Disk queued for resizing.`, {
          variant: 'info'
        });
        resetEventsPolling();
        this.props.request();
      })
      .catch(error => {
        const errors = path<Linode.ApiFieldError[]>(
          ['response', 'data', 'errors'],
          error
        );
        if (errors) {
          this.setDrawer({ errors, submitting: false }, () => {
            scrollErrorIntoView('linode-disk-drawer');
          });
        }
      });
  };

  createDisk = () => {
    const { linodeId, userSSHKeys, createLinodeDisk } = this.props;
    const {
      label,
      size,
      filesystem,
      image,
      password
    } = this.state.drawer.fields;
    if (!linodeId) {
      return;
    }

    this.setDrawer({ submitting: true, errors: undefined });

    createLinodeDisk({
      label,
      size,
      filesystem: filesystem === '_none_' ? undefined : filesystem,
      image,
      root_pass: password,
      authorized_users: userSSHKeys
        ? userSSHKeys.filter(u => u.selected).map(u => u.username)
        : undefined
    })
      .then(_ => {
        this.setDrawer(LinodeDisks.defaultDrawerState);
        this.props.request();
      })
      .catch(error => {
        const errors = path<Linode.ApiFieldError[]>(
          ['response', 'data', 'errors'],
          error
        );
        if (errors) {
          this.setDrawer({ errors, submitting: false }, () => {
            scrollErrorIntoView('linode-disk-drawer');
          });
        }
      });
  };

  renameDisk = () => {
    const { linodeId, updateLinodeDisk } = this.props;
    const {
      diskId,
      fields: { label }
    } = this.state.drawer;
    if (!linodeId || !diskId) {
      return;
    }

    this.setDrawer({ submitting: true, errors: undefined });

    updateLinodeDisk(diskId, { label })
      .then(_ => {
        this.setDrawer(LinodeDisks.defaultDrawerState);
        this.props.request();
      })
      .catch(error => {
        const errors = path<Linode.ApiFieldError[]>(
          ['response', 'data', 'errors'],
          error
        );
        if (errors) {
          this.setDrawer({ errors, submitting: false }, () => {
            scrollErrorIntoView('linode-disk-drawer');
          });
        }
      });
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
        this.props.enqueueSnackbar(`Disk queued for deletion.`, {
          variant: 'info'
        });
        this.props.request();
      })
      .catch(error => {
        const errors = pathOr<Linode.ApiFieldError[]>(
          [{ reason: 'There was an error deleting your disk.' }],
          ['response', 'data', 'errors'],
          error
        );
        this.setConfirmDelete({ errors, submitting: false });
      });
  };

  openDrawerForRename = ({
    id: diskId,
    filesystem,
    label,
    size
  }: Linode.Disk) => () => {
    this.setDrawer({
      diskId,
      errors: undefined,
      fields: {
        filesystem,
        label,
        size
      },
      mode: 'rename',
      open: true,
      submitting: false
    });
  };

  openDrawerForResize = ({
    id: diskId,
    filesystem,
    label,
    size
  }: Linode.Disk) => () => {
    this.setDrawer({
      diskId,
      errors: undefined,
      maximumSize: Math.max(size, this.calculateDiskFree(diskId)),
      fields: {
        filesystem,
        label,
        size
      },
      mode: 'resize',
      open: true,
      submitting: false
    });
  };

  openDrawerForCreation = () => {
    const maximumSize = this.calculateDiskFree(0);

    this.setDrawer({
      diskId: undefined,
      errors: undefined,
      maximumSize,
      fields: {
        filesystem: 'ext4',
        label: '',
        size: maximumSize
      },
      mode: 'create',
      open: true,
      submitting: false
    });
  };

  closeDrawer = () => {
    this.setDrawer({ open: false });
  };

  calculateDiskFree = (diskId: number): number => {
    /**
     * So if there's more than 100 disks, then this count will be off.
     */
    const { linodeTotalDisk, data } = this.props;
    if (!linodeTotalDisk || !data) {
      return 0;
    }
    return (
      linodeTotalDisk -
      data.reduce((acc: number, disk: Linode.Disk) => {
        return diskId === disk.id ? acc : acc + disk.size;
      }, 0)
    );
  };
}

const styled = withStyles(styles);

interface LinodeContextProps {
  linodeError: Linode.ApiFieldError[];
  linodeLoading: boolean;
  linodeId?: number;
  linodeStatus?: string;
  linodeTotalDisk?: number;
  deleteLinodeDisk: DeleteLinodeDisk;
  updateLinodeDisk: UpdateLinodeDisk;
  createLinodeDisk: CreateLinodeDisk;
  resizeLinodeDisk: ResizeLinodeDisk;
  readOnly: boolean;
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
    readOnly: linode._permissions === 'read_only'
  })
);

const paginated = Pagey((ownProps, params, filters) => {
  return getLinodeDisks(ownProps.linodeId, params, filters);
});

const enhanced = compose<CombinedProps, any>(
  styled,
  linodeContext,
  paginated,
  userSSHKeyHoc,
  withSnackbar
);

export default enhanced(LinodeDisks);
