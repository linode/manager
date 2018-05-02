import * as React from 'react';
import { connect } from 'react-redux';
import { assoc, compose, filter, map, path, prop } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableHead from 'material-ui/Table/TableHead';
import TableCell from 'material-ui/Table/TableCell';

import PlusSquare from 'src/assets/icons/plus-square.svg';
import { events$ } from 'src/events';
import { getLinodeDisks, createLinodeConfig, deleteLinodeConfig } from 'src/services/linodes';
import { getVolumes } from 'src/services/volumes';
import { ExtendedDisk, ExtendedVolume }
  from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import IconTextLink from 'src/components/IconTextLink';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import createDevicesFromStrings, { DevicesAsStrings } from
  'src/utilities/createDevicesFromStrings';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

import LinodeConfigsEmptyState from './LinodeConfigsEmptyState';
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
  open: boolean;
  errors?: Linode.ApiFieldError[];
  mode: 'create' | 'edit';
  label: string;
  kernel?: string;
  comments?: string;
  memory_limit?: number;
  run_level?: 'default' | 'single' | 'binbash';
  virt_mode?: 'fullvirt' | 'paravirt';
  helpers: {
    updatedb_disabled: boolean;
    distro: boolean;
    modules_dep: boolean;
    network: boolean;
    devtmpfs_automount: boolean;
  };
  root_device: string;
  devices: DevicesAsStrings;
  submitting: boolean;
  devicesCounter: number;
  useCustomRoot: boolean;
  maxMemory: number;
}

interface ConfirmDeleteState {
  open: boolean;
  submitting: boolean;
  id?: number;
  label?: string;
}

interface State {
  success?: string;
  submitting: boolean;
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  configDrawer: ConfigDrawerState;
  confirmDelete: ConfirmDeleteState;
}

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  linodeConfigs: Linode.Config[];
  linodeMemory: number;
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
  state: State = {
    submitting: false,
    devices: {
      disks: this.props.disks.response || [],
      volumes: this.props.volumes.response || [],
    },
    confirmDelete: {
      open: false,
      submitting: false,
    },
    configDrawer: {
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
    },
  };

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
        events$.next(genEvent('linode_reboot', linodeId, linodeLabel));

        this.setConfirmDelete({
          submitting: false,
        }, () => { this.setConfirmDelete({ submitting: false, open: false, id: undefined }); });
      })
      .catch((error) => {
        events$.next(genEvent('linode_reboot', linodeId, linodeLabel));
      });
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      configDrawer: {
        ...this.state.configDrawer,
        memory_limit: nextProps.linodeMemory,
      },
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
            this.props.linodeConfigs.map(config => (
              <TableRow key={config.id}>
                <TableCell>{config.label}</TableCell>
                <TableCell>
                  <LinodeConfigActionMenu
                    onEdit={() => null}
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

  createConfig = () => {
    const { linodeId, linodeLabel } = this.props;
    const {
      label, devices, kernel, comments, memory_limit, run_level, virt_mode, helpers, root_device,
    } = this.state.configDrawer;

    this.setConfigDrawer({ submitting: true });

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
      .then((repsonse) => {
        events$.next(genEvent('linode_reboot', linodeId, linodeLabel));

        this.setConfigDrawer({ submitting: false }, () => {
          this.setConfigDrawer({
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
            }});
        });
      })
      .catch((error) => {
        this.setConfigDrawer({ errors: error.response.data.errors });
      });
  }

  render() {
    const { classes, linodeConfigs } = this.props;
    const { configDrawer } = this.state;
    return (
      <React.Fragment>
        {
          <ExpansionPanel
            defaultExpanded
            heading="Advanced Configurations"
            success={this.state.success}
            actions={() =>
              <ActionsPanel>
                <Button
                  variant="raised"
                  color="primary"
                  onClick={() => {
                    const { linodeId, linodeLabel } = this.props;
                    genEvent('reboot_linode', linodeId, linodeLabel);
                  }}
                >
                  Save
                </Button>
              </ActionsPanel>
            }
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
            {
              !linodeConfigs || linodeConfigs.length > 0
                ? <this.LinodeConfigsTable />
                : <LinodeConfigsEmptyState />
            }
          </ExpansionPanel>
        }
        <LinodeConfigDrawer
          mode={'create'}
          kernels={this.props.kernels}
          availableDevices={this.state.devices}
          {...configDrawer}
          onChange={(key, value) => this.setConfigDrawer({ [key]: value })}
          onClose={() => this.setConfigDrawer({ open: false })}
          onSubmit={() => this.createConfig()}
        />
        <ConfirmationDialog
          title="Confirm Delete"
          open={this.state.confirmDelete.open}
          actions={() => <ActionsPanel>
            <Button
              onClick={() => this.deleteConfig()}
              variant="raised"
              color="secondary"
              className="destructive"
            >
              Delete
            </Button>
            <Button onClick={() => this.setConfirmDelete({ open: false, id: undefined })}>
              Cancel
            </Button>
          </ActionsPanel>}
        >
          Are you sure you want to delete "{this.state.confirmDelete.label}"
        </ConfirmationDialog>
      </React.Fragment>
    );
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
          filter<ExtendedVolume>(volume => volume.region === linodeRegion),
          map(volume => assoc('_id', `volume-${volume.id}`, volume)),
          prop('data'),
      ),
  ),
});

export default compose<any, any, any, any>(
  preloaded,
  connected,
  styled,
)(LinodeConfigsPanel);
