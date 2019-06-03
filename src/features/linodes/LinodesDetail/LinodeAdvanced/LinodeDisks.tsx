import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import RootRef from 'src/components/core/RootRef';
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
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import { resetEventsPolling } from 'src/events';
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
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
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

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
  LinodeContextProps &
  WithStyles<ClassNames> &
  WithSnackbarProps;

const defaultDrawerState: DrawerState = {
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

  renderTableContent = (data: Linode.Disk[], status?: string) => {
    const { readOnly } = this.props;

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
      .then(_ => {
        this.setDrawer(defaultDrawerState);
        this.props.enqueueSnackbar(`Disk queued for resizing.`, {
          variant: 'info'
        });
        resetEventsPolling();
      })
      .catch(error => {
        const errors = getAPIErrorOrDefault(error);
        this.setDrawer({ errors, submitting: false }, () => {
          scrollErrorIntoView('linode-disk-drawer');
        });
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
        this.setDrawer(defaultDrawerState);
      })
      .catch(error => {
        const errors = getAPIErrorOrDefault(error);
        this.setDrawer({ errors, submitting: false }, () => {
          scrollErrorIntoView('linode-disk-drawer');
        });
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
        this.setDrawer(defaultDrawerState);
      })
      .catch(error => {
        const errors = getAPIErrorOrDefault(error);
        this.setDrawer({ errors, submitting: false }, () => {
          scrollErrorIntoView('linode-disk-drawer');
        });
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
      })
      .catch(error => {
        const errors = getAPIErrorOrDefault(
          error,
          'There was an error deleting your disk.'
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
    const { linodeTotalDisk, disks } = this.props;
    if (!linodeTotalDisk || !disks) {
      return 0;
    }
    return (
      linodeTotalDisk -
      disks.reduce((acc: number, disk: Linode.Disk) => {
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
  disks: Linode.Disk[];
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
