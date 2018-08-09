import { allPass, append, assoc, compose, defaultTo, filter, findIndex, lensPath, map, prop, propEq, set } from 'ramda';
import * as React from 'react';
import 'typeface-lato';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/Grid';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import Table from 'src/components/Table';
import { events$ } from 'src/events';
import { withConfigs, withDisks, withLinode } from 'src/features/linodes/LinodesDetail/context';
import { ExtendedDisk, ExtendedVolume } from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import { genEvent } from 'src/features/linodes/LinodesLanding/powerActions';
import { createLinodeConfig, deleteLinodeConfig, updateLinodeConfig } from 'src/services/linodes';
import { getVolumes } from 'src/services/volumes';
import createDevicesFromStrings, { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';
import createStringsFromDevices from 'src/utilities/createStringsFromDevices';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

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

interface Props { }

interface PromiseLoaderProps {
  volumes: PromiseLoaderResponse<ExtendedVolume[]>;
}

type CombinedProps = Props
  & PromiseLoaderProps
  & LinodeContext
  & DiskContext
  & ConfigsContext
  & WithStyles<ClassNames>;

interface State {
  configDrawer: ConfigDrawerState;
  confirmDelete: ConfirmDeleteState;
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  linodeConfigs: Linode.Config[];
  linodeStatus: string;
  submitting: boolean;
  success?: string;
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

interface ConfirmDeleteState {
  open: boolean;
  submitting: boolean;
  id?: number;
  label?: string;
}

class LinodeConfigs extends React.Component<CombinedProps, State> {
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
  };

  render() {
    const { configDrawer } = this.state;
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
        >
          <Grid item>
            <Typography role="header" variant="title" className={classes.headline}>
              Configuration
                </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openConfigDrawerForCreation}
              label="Add a Configuration"
            />
          </Grid>
        </Grid>
        <this.linodeConfigsTable />
          <LinodeConfigDrawer
            mode={'create'}
            availableDevices={this.state.devices}
            {...configDrawer}
            onChange={(key, value) => this.setConfigDrawer({ [key]: value })}
            onClose={this.resetConfigDrawer}
            onSubmit={this.onConfigSubmit}
          />

        <ConfirmationDialog
          title="Confirm Delete"
          open={this.state.confirmDelete.open}
          onClose={this.resetConfirmConfigDelete}
          actions={this.deleteConfigConfirmationActions}
        >
          <Typography>
            Are you sure you want to delete "{this.state.confirmDelete.label}"
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
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

  onConfigSubmit = () => {
    switch (this.state.configDrawer.mode) {
      case 'create':
        return this.createConfig();

      case 'edit':
        return this.createConfig();
    }
  };

  openConfigDrawerForCreation = () => this.setConfigDrawer({
    open: true,
  });;

  resetConfigDrawer = () => this.setConfigDrawer(this.defaultConfigDrawerState);

  deleteConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button onClick={onClose} type="cancel" data-qa-cancel-delete>
        Cancel
      </Button>
      <Button type="secondary" destructive onClick={this.deleteConfig} data-qa-confirm-delete>
        Delete
    </Button>
    </ActionsPanel>
  );

  resetConfirmConfigDelete = () => this.setConfirmDelete({ open: false, id: undefined })

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

  linodeConfigsTable = () => {
    return (
      <Table aria-label="List of Configurations">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell />
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
}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Advanced Configurations' });

const preloaded = PromiseLoader<Props & LinodeContext>({
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

interface LinodeContext {
  linodeId: number;
  linodeLabel: string;
  linodeMemory: number;
  linodeTotalDisk: number;
  linodeRegion: string;
  linodeStatus: string;
};

const linodeContext = withLinode<LinodeContext>((context) => ({
  linodeId: context.data!.id,
  linodeLabel: context.data!.label,
  linodeMemory: context.data!.specs.memory,
  linodeTotalDisk: context.data!.specs.disk,
  linodeRegion: context.data!.region,
  linodeStatus: context.data!.status,
}));

interface DiskContext {
  linodeDisks: Linode.Disk[];
};

const disksContext = withDisks<DiskContext>((context) => ({
  linodeDisks: context.data,
}));

interface ConfigsContext {
  linodeConfigs: Linode.Config[];
}

const configsContext = withConfigs<ConfigsContext>((context) => ({
  linodeConfigs: context.data,
}));

const contexts = compose<any, any, any, any>(
  linodeContext,
  disksContext,
  configsContext,
);

const enhanced = compose<any, any, any, any, any>(
  errorBoundary,
  preloaded,
  styled,
  contexts,
);

export default enhanced(LinodeConfigs);

function replaceById<T>(data: T, id: number | string, list: T[]): T[] {
  const idx = findIndex(propEq('id', id), list);
  if (!idx) { return list; }

  return set(lensPath([idx]), data, list);
}
