import * as React from 'react';
import { connect } from 'react-redux';
import {
  allPass,
  append,
  assoc,
  compose,
  filter,
  findIndex,
  lensPath,
  map,
  path,
  prop,
  propEq,
  set,
} from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableHead from 'material-ui/Table/TableHead';
import TableCell from 'material-ui/Table/TableCell';

import PlusSquare from 'src/assets/icons/plus-square.svg';
import { events$ } from 'src/events';
import {
  createLinodeConfig,
  deleteLinodeConfig,
  getLinodeDisks,
  updateLinodeConfig,
} from 'src/services/linodes';

import Table from 'src/components/Table';
import { getVolumes } from 'src/services/volumes';
import { ExtendedDisk, ExtendedVolume }
  from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import IconTextLink from 'src/components/IconTextLink';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import createDevicesFromStrings, { DevicesAsStrings } from
  'src/utilities/createDevicesFromStrings';
import createStringsFromDevices from 'src/utilities/createStringsFromDevices';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';

import LinodeConfigActionMenu from './LinodeConfigActionMenu';
import LinodeConfigDrawer from './LinodeConfigDrawer';
import { genEvent } from 'src/features/linodes/LinodesLanding/powerActions';

type ClassNames = 'root' | 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  headline: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

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

interface ConfirmDeleteState {
  open: boolean;
  submitting: boolean;
  id?: number;
  label?: string;
}

interface State {
  configDrawer: ConfigDrawerState;
  confirmDelete: ConfirmDeleteState;
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  linodeConfigs: Linode.Config[];
  submitting: boolean;
  success?: string;
}

interface Props {
  linodeConfigs: Linode.Config[];
  linodeId: number;
  linodeLabel: string;
  linodeMemory: number;
  linodeRegion: string;
}

interface PromiseLoaderProps {
  disks: PromiseLoaderResponse<ExtendedDisk[]>;
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
    devices: {
      disks: this.props.disks.response || [],
      volumes: this.props.volumes.response || [],
    },
    confirmDelete: {
      open: false,
      submitting: false,
    },
    configDrawer: this.defaultConfigDrawerState,
  };

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      linodeConfigs: nextProps.linodeConfigs,
      configDrawer: {
        ...this.state.configDrawer,
        memory_limit: nextProps.linodeMemory,
      },
    });
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
                <IconTextLink
                  SideIcon={PlusSquare}
                  onClick={() => this.setConfigDrawer({ open: true })}
                  text="Add a Configuration"
                  title="Add a Configuration"
                />
              </Grid>
            </Grid>
            <this.LinodeConfigsTable />
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
        <ConfirmationDialog
          title="Confirm Delete"
          open={this.state.confirmDelete.open}
          actions={() =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                onClick={() => this.deleteConfig()}
                variant="raised"
                color="secondary"
                className="destructive"
              >
                Delete
              </Button>
              <Button
                onClick={() => this.setConfirmDelete({ open: false, id: undefined })}
                variant="raised"
                color="secondary"
                className="cancel"
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
              <TableRow key={config.id}>
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
      .then((response) => {
        // find and replace inline
        const idx = findIndex(propEq('id', configId), this.state.linodeConfigs);

        this.setState({
          linodeConfigs: set(lensPath([idx]), response.data, this.state.linodeConfigs),
        });

        this.setConfigDrawer(this.defaultConfigDrawerState);
      })
      .catch((error) => {
        this.setConfigDrawer({ errors: error.response.data.errors });
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
        this.setConfigDrawer({ errors: error.response.data.errors });
      });
  }
}

const mapStateToProps = (state: Linode.AppState) => ({
  kernels: state.resources.kernels && state.resources.kernels.data || [],
});

const connected = connect<ConnectedProps>(mapStateToProps);

const styled = withStyles<ClassNames>(styles, { withTheme: true });

const preloaded = PromiseLoader<Props>({
  /** @todo filter for available */
  disks: ({ linodeId }): Promise<ExtendedDisk[]> => getLinodeDisks(linodeId)
    .then(
      compose(
        map((disk: Linode.Disk) => assoc('_id', `disk-${disk.id}`, disk)),
        path(['data']),
      ),
  ),

  /** @todo filter for available */
  volumes: ({ linodeId, linodeRegion }): Promise<ExtendedVolume[]> => getVolumes()
    .then(
      compose<
        Linode.ResourcePage<Linode.Volume>,
        Linode.Volume[],
        ExtendedVolume[],
        ExtendedVolume[]
        >(
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
