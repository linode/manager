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
import Reload from 'src/assets/icons/reload.svg';
import { getLinodeDisks, createLinodeConfig } from 'src/services/linodes';
import { getVolumes } from 'src/services/volumes';
import { ExtendedDisk, ExtendedVolume }
  from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import IconTextLink from 'src/components/IconTextLink';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import createDevicesFromStrings, { DevicesAsStrings } from
  'src/utilities/createDevicesFromStrings';
import LinodeConfigsEmptyState from './LinodeConfigsEmptyState';
import LinodeConfigActionMenu from './LinodeConfigActionMenu';
import LinodeConfigDrawer from './LinodeConfigDrawer';

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

interface State {
  success?: string;
  submitting: boolean;
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  configDrawer: ConfigDrawerState;
}

interface Props {
  linodeId: number;
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

  setConfigDrawer = (obj: Partial<ConfigDrawerState>) => this.setState({
    configDrawer: {
      ...this.state.configDrawer,
      ...obj,
    },
  })

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
                  <LinodeConfigActionMenu onEdit={() => null} onDelete={() => null} />
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    );
  }

  createConfig = () => {
    const { linodeId } = this.props;
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
        this.setConfigDrawer({ submitting: false });
      })
      .catch((error) => {
        this.setConfigDrawer({ errors: error.response.data.errors });
      });
  }

  render() {
    const { classes, linodeConfigs } = this.props;
    const { submitting, configDrawer } = this.state;
    return (
      <React.Fragment>
        {
          <ExpansionPanel
            defaultExpanded
            heading="Advanced Configurations"
            success={this.state.success}
            actions={() =>
              <ActionsPanel>
                {
                  submitting
                    ? (
                      <Button
                        variant="raised"
                        color="secondary"
                        disabled
                        className="loading"
                      >
                        <Reload />
                      </Button>
                    )
                    : (
                      <Button
                        variant="raised"
                        color="primary"
                        onClick={() => null}
                      >
                        Save
                        </Button>
                    )
                }
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
