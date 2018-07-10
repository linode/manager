import { compose, path } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { resetEventsPolling } from 'src/events';
import { withDisks, withLinode } from 'src/features/linodes/LinodesDetail/context';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { createLinodeDisk, deleteLinodeDisk, resizeLinodeDisk, updateLinodeDisk } from 'src/services/linodes';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import LinodeDiskActionMenu from './LinodeDiskActionMenu';
import LinodeDiskDrawer from './LinodeDiskDrawer';

type ClassNames = 'root' | 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  headline: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props { }

interface DiskContextProps {
  disksUpdate: (fn: (disks: Linode.Disk[]) => Linode.Disk[]) => void,
  disks: Linode.Disk[];
  disksErrors: Linode.ApiFieldError[];
  disksLoading: boolean;
}

interface LinodeContextProps {
  linodeError: Linode.ApiFieldError[],
  linodeId: number;
  linodeLoading: boolean,
  linodeStatus: string;
  linodeTotalDisk: number;
}

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
  fields: {
    label: string;
    filesystem: string;
    size: number;
  };
}

interface State {
  drawer: DrawerState,
  confirmDelete: ConfirmDeleteState,
}

type CombinedProps = Props
  & DiskContextProps
  & LinodeContextProps
  & WithStyles<ClassNames>;

class LinodeDisks extends React.Component<CombinedProps, State> {
  static defaultDrawerState: DrawerState = {
    open: false,
    submitting: false,
    mode: 'create',
    errors: undefined,
    fields: {
      label: '',
      filesystem: 'ext4',
      size: 0,
    },
  };

  static defaultConfirmDeleteState: ConfirmDeleteState = {
    open: false,
    id: undefined,
    label: undefined,
    submitting: false,
  };

  state: State = {
    drawer: LinodeDisks.defaultDrawerState,
    confirmDelete: LinodeDisks.defaultConfirmDeleteState,
  };

  render() {
    const { classes, disks, disksErrors, disksLoading, linodeError, linodeLoading } = this.props;

    if (disksErrors || linodeError) {
      return <ErrorState errorText="There was an error loading disk images." />
    }

    if (disksLoading || linodeLoading) {
      return <CircleProgress />
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 16 }}>
          <Grid item>
            <Typography variant="title" className={classes.headline}>Disks</Typography>
          </Grid>
          <Grid item>
            <AddNewLink onClick={this.openDrawerForCreation} label="Add a Disk" />
          </Grid>
        </Grid>
        {disks.length === 0 ? <this.EmptyState /> : <this.Table />}
        <this.ConfirmationDialog />
        <this.Drawer />
      </React.Fragment>
    );
  }

  EmptyState = () => {
    return <Typography>Linode has no disks.</Typography>;
  }

  Table = () => {
    const { disks, linodeStatus } = this.props;
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Size</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {
            disks.map(disk => (
              <TableRow key={disk.id}>
                <TableCell>{disk.label}</TableCell>
                <TableCell>{disk.size} MB</TableCell>
                <TableCell>
                  <LinodeDiskActionMenu
                    linodeStatus={linodeStatus}
                    onRename={this.openDrawerForRename(disk)}
                    onResize={this.openDrawerForResize(disk)}
                    onDelete={this.openConfirmDelete(disk)}
                  />
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    );
  }

  /**
   * Disk Deletion Confirmation
   */
  setConfirmDelete = (obj: Partial<ConfirmDeleteState>, fn: () => void = () => null) => {
    const { confirmDelete } = this.state;
    this.setState(
      { confirmDelete: { ...confirmDelete, ...obj } },
      () => { fn(); },
    )
  }

  ConfirmationDialog = () => {
    const { open, label, errors } = this.state.confirmDelete;

    return (
      <ConfirmationDialog
        onClose={this.closeConfirmDelete}
        title="Confirm Delete"
        open={open}
        actions={this.confirmDeleteActions}
      >
        {
          errors && <Notice error text={errors[0].reason} />
        }
        <Typography>
          Are you sure you want to delete "{label}"
        </Typography>
      </ConfirmationDialog>
    );
  };

  confirmDeleteActions = ({ onClose }: { onClose: () => void }) => {
    const { submitting } = this.state.confirmDelete;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          onClick={this.deleteDisk}
          type="secondary"
          destructive
          loading={submitting}
          data-qa-confirm-delete
        >
          Delete
        </Button>
        <Button
          onClick={onClose}
          type="secondary"
          data-qa-cancel-delete
        >
          Cancel
        </Button>
      </ActionsPanel>
    );
  }

  openConfirmDelete = (disk: Linode.Disk) => () => {
    this.setConfirmDelete({
      open: true,
      submitting: false,
      errors: undefined,
      id: disk.id,
      label: disk.label,
    });
  };

  closeConfirmDelete = () => {
    this.setConfirmDelete({ open: false });
  };

  /**
   * Create/Rename/Resize Drawer
   */
  setDrawer = (obj: Partial<DrawerState>, fn: () => void = () => null) => {
    this.setState(
      { drawer: { ...this.state.drawer, ...obj } },
      () => { fn(); },
    )
  }

  Drawer = () => {
    const { linodeTotalDisk } = this.props;
    const {
      mode,
      open,
      errors,
      submitting,
      fields: { label, size, filesystem },
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
        totalSpaceMB={linodeTotalDisk}
        freeSpaceMB={this.calculateDiskFree()}
        onLabelChange={this.onLabelChange}
        onSizeChange={this.onSizeChange}
        onFilesystemChange={this.onFilesystemChange}
        onClose={this.closeDrawer}
        onSubmit={this.onDrawerSubmit}
      />
    );
  }

  onLabelChange = (label: string) => {
    const { fields } = this.state.drawer
    this.setDrawer({ fields: { ...fields, label } })
  }

  onSizeChange = (size: number) => {
    const { fields } = this.state.drawer;
    this.setDrawer({ fields: { ...fields, size } })
  }

  onFilesystemChange = (filesystem: string) => {
    const { fields } = this.state.drawer;
    this.setDrawer({ fields: { ...fields, filesystem } });
  }

  onDrawerSubmit = () => {
    switch (this.state.drawer.mode) {
      case 'create':
        return this.createDisk();
      case 'rename':
        return this.renameDisk();
      case 'resize':
        return this.resizeDisk();
    }
  }

  resizeDisk = () => {
    const { linodeId, disksUpdate } = this.props;
    const { diskId, fields: { size } } = this.state.drawer;
    if (!linodeId || !diskId) { return; }

    this.setDrawer({ submitting: true, errors: undefined, });

    resizeLinodeDisk(linodeId, diskId, size)
      .then(({ data }) => {
        this.setDrawer(LinodeDisks.defaultDrawerState);
        sendToast(`Disk scheduled for resizing.`);
        resetEventsPolling();
        disksUpdate((disks) => disks.map((disk) => disk.id === data.id ? data : disk));
      })
      .catch((error) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], error);
        if (errors) {
          this.setDrawer({ errors, submitting: false }, () => {
            scrollErrorIntoView('linode-disk-drawer');
          });
        }
      });
  };

  createDisk = () => {
    const { linodeId, disksUpdate } = this.props;
    const { label, size, filesystem } = this.state.drawer.fields;
    if (!linodeId) { return; }

    this.setDrawer({ submitting: true, errors: undefined });

    createLinodeDisk(linodeId, {
      label,
      size,
      filesystem: filesystem === '_none_' ? undefined : filesystem,
    })
      .then(({ data }) => {
        this.setDrawer(LinodeDisks.defaultDrawerState);
        disksUpdate((disks) => ([...disks, data]));
      })
      .catch((error) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], error);
        if (errors) {
          this.setDrawer({ errors, submitting: false }, () => {
            scrollErrorIntoView('linode-disk-drawer');
          });
        }
      });
  }

  renameDisk = () => {
    const { linodeId, disksUpdate } = this.props;
    const { diskId, fields: { label } } = this.state.drawer;
    if (!linodeId || !diskId) { return; }

    this.setDrawer({ submitting: true, errors: undefined, });

    updateLinodeDisk(linodeId, diskId, { label })
      .then(({ data }) => {
        this.setDrawer(LinodeDisks.defaultDrawerState);
        disksUpdate((disks) => disks.map((disk) => disk.id === data.id ? data : disk));
      })
      .catch((error) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], error);
        if (errors) {
          this.setDrawer({ errors, submitting: false }, () => {
            scrollErrorIntoView('linode-disk-drawer');
          });
        }
      });
  }

  deleteDisk = () => {
    this.setConfirmDelete({ submitting: true, errors: undefined, });

    const { linodeId, disksUpdate } = this.props;
    const { id: diskId } = this.state.confirmDelete;
    if (!linodeId || !diskId) { return; }

    deleteLinodeDisk(linodeId, diskId)
      .then(() => {
        this.setConfirmDelete({ open: false, errors: undefined });
        disksUpdate((disks) => disks.filter((v) => v.id !== diskId));
      })
      .catch((error) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], error);
        if (errors) {
          this.setConfirmDelete({ errors, submitting: false });
        }
      });
  }

  openDrawerForRename = ({ id: diskId, filesystem, label, size }: Linode.Disk) => () => {
    this.setDrawer({
      diskId,
      errors: undefined,
      fields: {
        filesystem,
        label,
        size,
      },
      mode: 'rename',
      open: true,
      submitting: false,
    })
  };

  openDrawerForResize = ({ id: diskId, filesystem, label, size }: Linode.Disk) => () => {
    this.setDrawer({
      diskId,
      errors: undefined,
      fields: {
        filesystem,
        label,
        size,
      },
      mode: 'resize',
      open: true,
      submitting: false,
    })
  };

  openDrawerForCreation = () => {
    this.setDrawer({
      diskId: undefined,
      errors: undefined,
      fields: {
        filesystem: 'ext4',
        label: '',
        size: 0,
      },
      mode: 'create',
      open: true,
      submitting: false,
    })
  };

  closeDrawer = () => {
    this.setDrawer({ open: false });
  };

  calculateDiskFree = (): number => {
    const { linodeTotalDisk, disks } = this.props;

    return linodeTotalDisk - disks.reduce((acc: number, disk: Linode.Disk) => {
      return acc + disk.size;
    }, 0);
  }
}

const styled = withStyles(styles, { withTheme: true });

const diskContext = withDisks((context) => {
  const {
    data: disks,
    loading,
    errors,
    lastUpdated,
    update,
  } = context;

  if (lastUpdated === 0 && loading) {
    return { disksLoading: true, }
  }

  return {
    disksLoading: false,
    diskErrors: errors,
    disks,
    disksUpdate: update,
  };
});

const linodeContext = withLinode((context) => {
  const { loading, errors, data, lastUpdated } = context;

  if (lastUpdated === 0 && loading) {
    return {
      linodeLoading: true,
    };
  }

  return {
    linodeError: errors,
    linodeId: data!.id,
    linodeTotalDisk: data!.specs.disk,
    linodeStatus: data!.status,
  };
});

const enhanced = compose(styled, linodeContext, diskContext);

export default enhanced(LinodeDisks);
