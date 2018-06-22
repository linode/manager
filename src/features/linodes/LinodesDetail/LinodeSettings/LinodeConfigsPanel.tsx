import * as React from 'react';
import { connect } from 'react-redux';
import {
  allPass,
  append,
  assoc,
  compose,
  defaultTo,
  filter,
  findIndex,
  lensPath,
  map,
  prop,
  propEq,
  set,
} from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';

import { events$ } from 'src/events';
import {
  createLinodeConfig,
  deleteLinodeConfig,
  updateLinodeConfig,
  createLinodeDisk,
  updateLinodeDisk,
  deleteLinodeDisk,
} from 'src/services/linodes';

import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import { getVolumes } from 'src/services/volumes';
import { ExtendedDisk, ExtendedVolume }
  from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import createDevicesFromStrings, { DevicesAsStrings } from
  'src/utilities/createDevicesFromStrings';
import createStringsFromDevices from 'src/utilities/createStringsFromDevices';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';

import LinodeConfigActionMenu from './LinodeConfigActionMenu';
import LinodeConfigDrawer from './LinodeConfigDrawer';
import { genEvent } from 'src/features/linodes/LinodesLanding/powerActions';
import LinodeDiskActionMenu from './LinodeDiskActionMenu';
import LinodeDiskDrawer from './LinodeDiskDrawer';
import AddNewLink from 'src/components/AddNewLink';

type ClassNames = 'root' | 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  headline: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface FormDrawerState<T> {
  open: boolean;
  submitting: boolean;
  mode: 'create' | 'edit';
  errors?: Linode.ApiFieldError[];
  fields: T;
}

interface ConfigDrawerState {
  comments?: string;
  configId?: number;
  devices: DevicesAsStrings;
  devicesCounter: number;
  errors?: Linode.ApiFieldError[];
  helpers: {
    updatedb_disabled: boolean;
    distro: boolean;
    modules_dep: boolean;
    network: boolean;
    devtmpfs_automount: boolean;
  };
  kernel?: string;
  label: string;
  maxMemory: number;
  memory_limit?: number;
  mode: 'create' | 'edit';
  open: boolean;
  root_device: string;
  run_level?: 'default' | 'single' | 'binbash';
  submitting: boolean;
  useCustomRoot: boolean;
  virt_mode?: 'fullvirt' | 'paravirt';
}

interface ConfirmDiskDelete {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  id?: number;
  label?: string;
}

interface DiskFormFields {
  label: string;
  filesystem: string;
  size: number;
}

interface DiskDrawerState extends FormDrawerState<DiskFormFields> {
  diskId?: number;
}

interface ConfirmDeleteState {
  open: boolean;
  submitting: boolean;
  id?: number;
  label?: string;
}

interface State {
  configDrawer: ConfigDrawerState;
  confirmDelete: ConfirmDeleteState;
  diskDrawer: DiskDrawerState;
  confirmDiskDelete: ConfirmDiskDelete;
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  linodeConfigs: Linode.Config[];
  linodeStatus: string;
  submitting: boolean;
  success?: string;
}

interface Props {
  linodeDisks: Linode.Disk[];
  linodeConfigs: Linode.Config[];
  linodeId: number;
  linodeLabel: string;
  linodeMemory: number;
  linodeTotalDisk: number;
  linodeRegion: string;
  linodeStatus: string;
}

interface PromiseLoaderProps {
  volumes: PromiseLoaderResponse<ExtendedVolume[]>;
}

interface ConnectedProps {
  kernels: Linode.Kernel[];
}

type CombinedProps = Props
  & ConnectedProps
  & PromiseLoaderProps
  & WithStyles<ClassNames>;

class LinodeConfigsPanel extends React.Component<CombinedProps, State> {
  defaultConfirmDiskDeleteState: ConfirmDiskDelete = {
    open: false,
    id: undefined,
    label: undefined,
    submitting: false,
  };

  defaultDiskDrawerState: DiskDrawerState = {
    open: false,
    submitting: false,
    mode: 'create',
    errors: undefined,
    fields: {
      label: '',
      filesystem: '_none_',
      size: 0,
    },
  };

  defaultConfigDrawerState: ConfigDrawerState = {
    open: false,
    submitting: false,
    mode: 'create',
    label: '',
    virt_mode: 'paravirt',
    run_level: 'default',
    kernel: 'linode/latest-64bit',
    memory_limit: this.props.linodeMemory,
    maxMemory: this.props.linodeMemory,
    devices: {},
    devicesCounter: 99,
    useCustomRoot: false,
    root_device: '',
    helpers: {
      updatedb_disabled: false,
      distro: false,
      modules_dep: false,
      network: false,
      devtmpfs_automount: false,
    },
    errors: undefined,
  };

  state: State = {
    submitting: false,
    linodeConfigs: this.props.linodeConfigs,
    linodeStatus: this.props.linodeStatus,
    devices: {
      disks: compose(
        map<Linode.Disk, ExtendedDisk>(disk => assoc('_id', `disk-${disk.id}`, disk)),
        defaultTo([]),
      )(this.props.linodeDisks),
      volumes: this.props.volumes.response || [],
    },
    confirmDelete: {
      open: false,
      submitting: false,
    },
    configDrawer: this.defaultConfigDrawerState,
    diskDrawer: this.defaultDiskDrawerState,
    confirmDiskDelete: this.defaultConfirmDiskDeleteState,
  };

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      linodeConfigs: nextProps.linodeConfigs,
      linodeStatus: nextProps.linodeStatus,
      configDrawer: {
        ...this.state.configDrawer,
        memory_limit: nextProps.linodeMemory,
      },
    });
  }

  calculateDiskFree = (): number => {
    return this.props.linodeTotalDisk -
      this.state.devices.disks.reduce((acc: number, disk: ExtendedDisk) => {
        return acc + disk.size;
      }, 0);
  }

  render() {
    const { classes } = this.props;
    const { configDrawer } = this.state;
    return (
      <React.Fragment>
        {
          <ExpansionPanel
            defaultExpanded
            heading="Advanced Configurations"
            success={this.state.success}
          >
            <Grid
              container
              justify="space-between"
              alignItems="flex-end"
            >
              <Grid item>
                <Typography variant="title" className={classes.headline}>
                  Configuration
                </Typography>
              </Grid>
              <Grid item>
                <AddNewLink
                  onClick={() => this.setConfigDrawer({ open: true })}
                  label="Add a Configuration"
                />
              </Grid>
            </Grid>
            <this.LinodeConfigsTable />
            <Grid
              container
              justify="space-between"
              alignItems="flex-end"
              style={{ marginTop: 16 }}
            >
              <Grid item>
                <Typography variant="title" className={classes.headline}>
                  Disks
                </Typography>
              </Grid>
              <Grid item>
                <AddNewLink
                  onClick={() => this.setDiskDrawer({ open: true })}
                  label="Add a Disk"
                />
              </Grid>
            </Grid>
            <this.LinodeDisksTable />
          </ExpansionPanel>
        }
        <LinodeConfigDrawer
          mode={'create'}
          kernels={this.props.kernels}
          availableDevices={this.state.devices}
          {...configDrawer}
          onChange={(key, value) => this.setConfigDrawer({ [key]: value })}
          onClose={() => this.setConfigDrawer(this.defaultConfigDrawerState)}
          onSubmit={() =>
            this.state.configDrawer.mode === 'create'
              ? this.createConfig()
              : this.updateConfig()
          }
        />
        <LinodeDiskDrawer
          mode={this.state.diskDrawer.mode}
          open={this.state.diskDrawer.open}
          errors={this.state.diskDrawer.errors}
          label={this.state.diskDrawer.fields.label}
          filesystem={this.state.diskDrawer.fields.filesystem}
          size={this.state.diskDrawer.fields.size}
          totalSpaceMB={this.props.linodeTotalDisk}
          freeSpaceMB={this.calculateDiskFree()}
          onChange={(key, value) => this.setDiskDrawer({
            fields: { ...this.state.diskDrawer.fields, [key]: value },
          })}
          onClose={() => this.setDiskDrawer(this.defaultDiskDrawerState)}
          onSubmit={() =>
            this.state.diskDrawer.mode === 'create'
              ? this.createDisk()
              : this.updateDisk()
          }
        />
        <ConfirmationDialog
          title="Confirm Delete"
          open={this.state.confirmDelete.open}
          onClose={() => this.setConfirmDelete({ open: false, id: undefined })}
          actions={({ onClose }) =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                onClick={() => this.deleteConfig()}
                variant="raised"
                color="secondary"
                className="destructive"
                data-qa-confirm-delete
              >
                Delete
              </Button>
              <Button
                onClick={onClose}
                variant="raised"
                color="secondary"
                className="cancel"
                data-qa-cancel-delete
              >
                Cancel
              </Button>
            </ActionsPanel>
          }
        >
          <Typography>
            Are you sure you want to delete "{this.state.confirmDelete.label}"
          </Typography>
        </ConfirmationDialog>
        <ConfirmationDialog
          onClose={() => this.setConfirmDiskDelete({ open: false, id: undefined })}
          title="Confirm Delete"
          open={this.state.confirmDiskDelete.open}
          actions={({ onClose }) =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                onClick={() => this.deleteDisk()}
                variant="raised"
                color="secondary"
                className="destructive"
                data-qa-confirm-delete
              >
                Delete
              </Button>
              <Button
                onClick={onClose}
                variant="raised"
                color="secondary"
                className="cancel"
                data-qa-cancel-delete
              >
                Cancel
              </Button>
            </ActionsPanel>
          }
        >
          <Typography>
            Are you sure you want to delete "{this.state.confirmDiskDelete.label}"
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  setConfigDrawer = (obj: Partial<ConfigDrawerState>, fn?: () => void) => this.setState({
    configDrawer: {
      ...this.state.configDrawer,
      ...obj,
    },
  }, () => { if (fn) fn(); })

  setConfirmDelete = (obj: Partial<ConfirmDeleteState>, fn?: () => void) => this.setState({
    confirmDelete: {
      ...this.state.confirmDelete,
      ...obj,
    },
  }, () => { if (fn) fn(); })

  setDiskDrawer = (obj: Partial<DiskDrawerState>, fn?: () => void) => this.setState({
    diskDrawer: {
      ...this.state.diskDrawer,
      ...obj,
    },
  }, () => { if (fn) fn(); })

  setConfirmDiskDelete = (obj: Partial<ConfirmDiskDelete>, fn?: () => void) => this.setState({
    confirmDiskDelete: {
      ...this.state.confirmDiskDelete,
      ...obj,
    },
  }, () => { if (fn) fn(); })

  setEdit = (config: Linode.Config) => {
    this.setConfigDrawer({
      comments: config.comments,
      configId: config.id,
      devices: createStringsFromDevices(config.devices),
      devicesCounter: 99,
      helpers: config.helpers,
      kernel: config.kernel,
      label: config.label,
      maxMemory: this.props.linodeMemory,
      memory_limit: config.memory_limit === 0 ? this.props.linodeMemory : config.memory_limit,
      mode: 'edit',
      open: true,
      root_device: config.root_device,
      run_level: config.run_level,
      submitting: false,
      useCustomRoot: ![
        '/dev/sda', '/dev/sdb', '/dev/sdc', '/dev/sdd',
        '/dev/sde', '/dev/sdf', '/dev/sdg', '/dev/sd',
      ].includes(config.root_device),
      virt_mode: config.virt_mode,
    });
  }

  confirmDelete = (id: number, label: string) => {
    this.setConfirmDelete({ open: true, id, label });
  }

  deleteConfig = () => {
    this.setConfirmDelete({ submitting: true });
    const { linodeId, linodeLabel } = this.props;
    const { confirmDelete: { id: configId } } = this.state;
    if (!configId) { return; }

    deleteLinodeConfig(linodeId, configId)
      .then(() => {
        this.setState({
          linodeConfigs: this.state.linodeConfigs.filter(config => config.id !== configId),
        });

        events$.next(genEvent('linode_reboot', linodeId, linodeLabel));

        this.setConfirmDelete({
          submitting: false,
        }, () => { this.setConfirmDelete({ submitting: false, open: false, id: undefined }); });
      })
      .catch((error) => {
        events$.next(genEvent('linode_reboot', linodeId, linodeLabel));
      });
  }

  LinodeDisksTable = () => {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Size</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {
            this.state.devices.disks.map(disk => (
              <TableRow key={disk.id}>
                <TableCell>{disk.label}</TableCell>
                <TableCell>{disk.size} MB</TableCell>
                <TableCell>
                  <LinodeDiskActionMenu
                    linodeStatus={this.state.linodeStatus}
                    onEdit={() => this.setDiskDrawer({
                      mode: 'edit',
                      open: true,
                      diskId: disk.id,
                      fields: {
                        label: disk.label,
                        size: disk.size,
                        filesystem: disk.filesystem,
                      },
                    })}
                    onDelete={() => this.setConfirmDiskDelete({
                      open: true,
                      id: disk.id,
                      label: disk.label,
                    })}
                  />
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    );
  }

  LinodeConfigsTable = () => {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {
            this.state.linodeConfigs.map(config => (
              <TableRow key={config.id} data-qa-config={config.label}>
                <TableCell>{config.label}</TableCell>
                <TableCell>
                  <LinodeConfigActionMenu
                    onEdit={() => this.setEdit(config)}
                    onDelete={() => this.confirmDelete(config.id, config.label)}
                  />
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    );
  }

  updateConfig = () => {
    const { linodeId } = this.props;
    const {
      comments,
      configId,
      devices,
      helpers,
      kernel,
      label,
      memory_limit,
      root_device,
      run_level,
      virt_mode,
    } = this.state.configDrawer;

    if (!linodeId || !configId) { return; }

    this.setConfigDrawer({ submitting: true });

    updateLinodeConfig(
      linodeId,
      configId,
      {
        comments,
        devices: createDevicesFromStrings(devices),
        helpers,
        kernel,
        label,
        memory_limit,
        root_device,
        run_level,
        virt_mode,
      },
    )
      .then(({ data }) => {
        // find and replace inline

        this.setState({
          linodeConfigs: replaceById(data, data.id, this.state.linodeConfigs),
        });

        this.setConfigDrawer(this.defaultConfigDrawerState);
      })
      .catch((error) => {
        this.setConfigDrawer({ errors: error.response.data.errors }, () => {
          scrollErrorIntoView('linode-config-drawer');
        });
      });
  }

  createConfig = () => {
    const { linodeId, linodeLabel } = this.props;
    const {
      label, devices, kernel, comments, memory_limit, run_level, virt_mode, helpers, root_device,
    } = this.state.configDrawer;

    this.setConfigDrawer({ submitting: true, errors: undefined });

    createLinodeConfig(linodeId, {
      label,
      devices: createDevicesFromStrings(devices),
      kernel,
      comments,
      memory_limit,
      run_level,
      virt_mode,
      helpers,
      root_device,
    })
      .then((response) => {
        events$.next(genEvent('linode_reboot', linodeId, linodeLabel));

        this.setState({ linodeConfigs: append(response.data, this.state.linodeConfigs) });

        this.setConfigDrawer({ submitting: false }, () => {
          this.setConfigDrawer(this.defaultConfigDrawerState);
        });
      })
      .catch((error) => {
        this.setConfigDrawer({ errors: error.response.data.errors }, () => {
          scrollErrorIntoView('linode-config-drawer');
        });
      });
  }

  createDisk = () => {
    const { linodeId } = this.props;
    const { label, size, filesystem } = this.state.diskDrawer.fields;
    if (!linodeId) { return; }

    this.setDiskDrawer({ submitting: true, errors: undefined });

    createLinodeDisk(linodeId, {
      label,
      size,
      filesystem: filesystem === '_none_' ? undefined : filesystem,
    })
      .then(({ data }) => {
        this.setState({
          devices: {
            ...this.state.devices,
            disks: [...this.state.devices.disks, { ...data, _id: `disk-${data.id}` }],
          },
        });
        this.setDiskDrawer(this.defaultDiskDrawerState);
      })
      .catch((error) => {
        this.setDiskDrawer({ errors: error.response.data.errors }, () => {
          scrollErrorIntoView('linode-disk-drawer');
        });
      });
  }

  updateDisk = () => {
    const { linodeId } = this.props;
    const { diskDrawer: { diskId, fields: { label } } } = this.state;
    if (!linodeId || !diskId) { return; }

    this.setDiskDrawer({ submitting: true });

    updateLinodeDisk(linodeId, diskId, { label })
      .then(({ data }) => {
        this.setState({
          devices: {
            ...this.state.devices,
            disks: replaceById(data as ExtendedDisk, data.id, this.state.devices.disks),
          },
        });
        this.setDiskDrawer(this.defaultDiskDrawerState);
      })
      .catch((error) => {
        this.setDiskDrawer({ errors: error.response.data.errors }, () => {
          scrollErrorIntoView('linode-disk-drawer');
        });
      });
  }

  deleteDisk = () => {
    this.setConfirmDiskDelete({ submitting: true });
    const { linodeId } = this.props;
    const { confirmDiskDelete: { id: diskId } } = this.state;
    if (!linodeId || !diskId) { return; }

    deleteLinodeDisk(linodeId, diskId)
      .then(() => {
        this.setState({
          devices: {
            ...this.state.devices,
            disks: this.state.devices.disks.filter(d => d.id !== diskId),
          },
        });
        this.setConfirmDiskDelete({ open: false, errors: undefined });
      })
      .catch((error) => {
        this.setConfirmDiskDelete({ errors: error.response.data.error }, () => {
          scrollErrorIntoView('linode-disk-drawer');
        });
      });
  }
}

const mapStateToProps = (state: Linode.AppState) => ({
  kernels: state.resources.kernels && state.resources.kernels.data || [],
});

const connected = connect<ConnectedProps>(mapStateToProps);

const styled = withStyles<ClassNames>(styles, { withTheme: true });

const preloaded = PromiseLoader<Props>({
  volumes: ({ linodeId, linodeRegion }): Promise<ExtendedVolume[]> => getVolumes()
    .then(
      compose<
        Linode.ResourcePage<Linode.Volume>,
        Linode.Volume[],
        ExtendedVolume[],
        ExtendedVolume[]>(
          filter<ExtendedVolume>(allPass([
            volume => volume.region === linodeRegion,
            volume => volume.linode_id === null || volume.linode_id === linodeId,
          ])),
          map(volume => assoc('_id', `volume-${volume.id}`, volume)),
          prop('data'),
      ),
  ),
});

const errorBoundary = PanelErrorBoundary({ heading: 'Advanced Configurations' });

export default compose<any, any, any, any, any>(
  errorBoundary,
  preloaded,
  connected,
  styled,
)(LinodeConfigsPanel);

function replaceById<T>(data: T, id: number | string, list: T[]): T[] {
  const idx = findIndex(propEq('id', id), list);
  if (!idx) { return list; }

  return set(lensPath([idx]), data, list);
}
