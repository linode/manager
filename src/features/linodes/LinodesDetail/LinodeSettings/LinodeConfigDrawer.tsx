import { pathOr } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import CircleProgress from 'src/components/CircleProgress';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import DeviceSelection, { ExtendedDisk, ExtendedVolume } from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import { createLinodeConfig, getAllKernels, getAllLinodeDisks, getLinodeConfig, updateLinodeConfig } from 'src/services/linodes';
import { getAllVolumes } from 'src/services/volumes';
import createDevicesFromStrings, { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';
import createStringsFromDevices from 'src/utilities/createStringsFromDevices';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root'
  | 'section'
  | 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  section: {
    marginTop: theme.spacing.unit * 2,
  },
  divider: {
    margin: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px 0 `,
    width: `calc(100% - ${theme.spacing.unit * 2}px)`,
  },
});

interface Helpers {
  updatedb_disabled: boolean;
  distro: boolean;
  modules_dep: boolean;
  network: boolean;
  devtmpfs_automount: boolean;
}

interface EditableFields {
  useCustomRoot: boolean;
  label: string;
  devices: DevicesAsStrings;
  kernel?: string;
  comments?: string;
  memory_limit?: number;
  run_level?: 'default' | 'single' | 'binbash';
  virt_mode?: 'fullvirt' | 'paravirt';
  helpers: Helpers;
  root_device: string;
}

interface Props {
  linodeId: number
  linodeRegion: string;
  maxMemory: number;
  open: boolean;
  linodeConfigId?: number
  onClose: () => void;
  onSuccess: () => void;
}

interface State {
  loading: {
    kernels: boolean,
    config: boolean,
  },
  kernels: Linode.Kernel[];
  errors?: Error | Linode.ApiFieldError[];
  fields: EditableFields;
  availableDevices: {
    volumes: ExtendedVolume[];
    disks: ExtendedDisk[];
  }
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeConfigDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    loading: {
      kernels: false,
      config: false,
    },
    kernels: [],
    availableDevices: {
      disks: [],
      volumes: [],
    },
    fields: LinodeConfigDrawer.defaultFieldsValues(this.props.maxMemory),
  };

  static defaultFieldsValues: (maxMemory: number) => EditableFields =
    (maxMemory) => ({
      comments: '',
      devices: {},
      helpers: {
        devtmpfs_automount: true,
        distro: true,
        modules_dep: true,
        network: true,
        updatedb_disabled: true,
      },
      kernel: 'linode/latest-64bit',
      label: '',
      memory_limit: maxMemory,
      root_device: '/dev/sda',
      run_level: 'default',
      useCustomRoot: false,
      virt_mode: 'paravirt',
    });

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { linodeId, linodeConfigId } = this.props;

    if (this.isOpening(prevProps.open, this.props.open)) {

      /** Reset the form to the default create state. */
      this.setState({ fields: LinodeConfigDrawer.defaultFieldsValues(this.props.maxMemory) })

      if (this.state.errors) {
        this.setState({ errors: undefined });
      }

      /**
       * Get all the kernels for usage in the Kernel selection menu.
       * @todo We could (should?) put this back into Redux.
       */
      if (prevState.kernels.length === 0) {
        this.requestKernels();
      }

      this.getAvailableDevices()

      if (linodeConfigId !== undefined) {
        this.setState({ loading: { ...this.state.loading, config: true } });

        getLinodeConfig(linodeId, linodeConfigId)
          .then(config => {
            this.setState({
              loading: {
                ...this.state.loading,
                config: false,
              },
              fields: {
                useCustomRoot: isUsingCustomRoot(config.root_device),
                label: config.label,
                devices: createStringsFromDevices(config.devices),
                kernel: config.kernel,
                comments: config.comments,
                memory_limit: config.memory_limit === 0 ? this.props.maxMemory : config.memory_limit,
                run_level: config.run_level,
                virt_mode: config.virt_mode,
                helpers: config.helpers,
                root_device: config.root_device,
              },
            });
          })
          .catch(error => {
            this.setState({ errors: Error(), loading: { ...this.state.loading, config: false } })
          });
      }
      /**
       * If the linodeConfigId is set, we're editting, so we query to get the config data and
       * fill out the form with the data.
       */
    }
  }

  render() {
    const { open, onClose, linodeConfigId } = this.props;
    const { errors } = this.state;
    const loading = Object.values(this.state.loading).some(v => v === true);

    return (
      <Drawer title={`${linodeConfigId ? 'Edit' : 'Add'} Linode Configuration`} open={open} onClose={onClose}>
        <Grid container direction="row">
          {this.renderContent(errors, loading)}
        </Grid>
      </Drawer>
    );
  }

  renderContent = (errors: Error | Linode.ApiFieldError[] = [], loading: boolean) => {
    if (errors instanceof Error) {
      return this.renderErrorState();
    }

    if (loading) {
      return this.renderLoading();
    }

    return this.renderForm(errors);
  }

  renderLoading = () => < CircleProgress />

  renderErrorState = () => <ErrorState errorText="Unable to loading configurations." />;

  renderForm = (errors?: Linode.ApiFieldError[]) => {
    const { onClose, maxMemory, classes } = this.props;

    const {
      kernels,
      availableDevices,
      fields: {
        useCustomRoot,
        label,
        kernel,
        comments,
        memory_limit,
        run_level,
        virt_mode,
        helpers,
        root_device,
      },
    } = this.state;

    const errorFor = getAPIErrorsFor({
      label: 'label',
      kernel: 'kernel',
      comments: 'comments',
      memory_limit: 'memory limit',
      run_level: 'run level',
      virt_mode: 'virtualization mode',
      root_device: 'root device',
    }, errors);

    const generalError = errorFor('none');

    return (
      <React.Fragment>
        {generalError && <Notice error errorGroup="linode-config-drawer" text={generalError} />}
        <Grid item xs={12} className={classes.section}>
          <Typography role="header" variant="subheading">Label and Comments</Typography>
          <TextField
            label="Label"
            required
            value={label}
            onChange={this.handleChangeLabel}
            errorText={errorFor('label')}
            errorGroup="linode-config-drawer"
          />

          <TextField
            label="Comments"
            value={comments}
            onChange={this.handleChangeComments}
            multiline={true}
            rows={3}
            errorText={errorFor('comments')}
            errorGroup="linode-config-drawer"
          />
        </Grid>

        <Divider className={classes.divider} />

        <Grid item xs={12} className={classes.section}>
          <Typography role="header" variant="subheading">Virtual Machine</Typography>
          <FormControl component="fieldset">
            <FormLabel
              htmlFor="virt_mode"
              component="label"
            >
              VM Mode
            </FormLabel>
            <RadioGroup
              aria-label="virt_mode"
              name="virt_mode"
              value={virt_mode}
              onChange={this.handleChangeVirtMode}
            >
              <FormControlLabel value="paravirt" label="Paravirtulization" control={<Radio />} />
              <FormControlLabel value="fullvirt" label="Full-virtulization" control={<Radio />} />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Divider className={classes.divider} />

        <Grid item xs={12} className={classes.section}>
          <Typography role="header" variant="subheading">Boot Settings</Typography>
          {kernels &&
            <TextField
              label="Kernel"
              select={true}
              value={kernel}
              onChange={this.handleChangeKernel}
              errorText={errorFor('kernel')}
              errorGroup="linode-config-drawer"
            >
              <MenuItem value="none" disabled><em>Select a Kernel</em></MenuItem>
              {
                kernels.map(eachKernel =>
                  <MenuItem
                    // Can't use ID for key until DBA-162 is closed.
                    key={`${eachKernel.id}-${eachKernel.label}`}
                    value={eachKernel.id}
                  >
                    {eachKernel.label}
                  </MenuItem>)
              }
            </TextField>}

          <FormControl fullWidth component="fieldset">
            <FormLabel
              htmlFor="run_level"
              component="label"
            >
              Run Level
              </FormLabel>
            <RadioGroup
              aria-label="run_level"
              name="run_level"
              value={run_level}
              onChange={this.handleChangeRunLevel}
            >
              <FormControlLabel value="default" label="Run Default Level" control={<Radio />} />
              <FormControlLabel value="single" label="Single user mode" control={<Radio />} />
              <FormControlLabel value="binbash" label="init=/bin/bash" control={<Radio />} />
            </RadioGroup>
          </FormControl>

          <TextField
            type="number"
            label="Memory Limit"
            value={memory_limit}
            onChange={this.handleMemoryLimitChange}
            helperText={`Max: ${maxMemory}`}
            errorText={errorFor('memory_limit')}
          />
        </Grid>

        <Divider className={classes.divider} />

        <Grid item xs={12} className={classes.section}>
          <Typography role="header" variant="subheading">Block Device Assignment</Typography>
          <DeviceSelection
            slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg', 'sdh']}
            devices={availableDevices}
            onChange={this.handleDevicesChanges}
            getSelected={slot => pathOr('', [slot], this.state.fields.devices)}
            counter={99}
          />

          <FormControl fullWidth>
            <FormControlLabel
              label="Use Custom Root"
              control={
                <Toggle
                  checked={useCustomRoot}
                  onChange={this.handleUseCustomRootChange}
                />
              }
            />

            <TextField
              label={`${useCustomRoot ? 'Custom ' : ''}Root Device`}
              value={root_device}
              onChange={this.handleRootDeviceChange}
              inputProps={{ name: 'root_device', id: 'root_device' }}
              select={!useCustomRoot}
              fullWidth
              autoFocus={useCustomRoot && true}
              errorText={errorFor('root_device')}
              errorGroup="linode-config-drawer"
            >
              {
                !useCustomRoot &&
                [
                  '/dev/sda',
                  '/dev/sdb',
                  '/dev/sdc',
                  '/dev/sdd',
                  '/dev/sde',
                  '/dev/sdf',
                  '/dev/sdg',
                  '/dev/sdh',
                ].map(path => <MenuItem key={path} value={path}>{path}</MenuItem>)
              }
            </TextField>
          </FormControl>
        </Grid>

        <Divider className={classes.divider} />

        <Grid item xs={12} className={classes.section}>
          <Typography role="header" variant="subheading">Filesystem/Boot Helpers</Typography>
          <FormControl fullWidth component="fieldset">
            <FormGroup>
              <FormControlLabel
                label="Distro Helper"
                control={
                  <Toggle
                    checked={helpers.distro}
                    onChange={this.handleToggleDistroHelper}
                  />
                }
              />

              <FormControlLabel
                label="Disable updatedb"
                control={
                  <Toggle
                    checked={helpers.updatedb_disabled}
                    onChange={this.handleToggleUpdateDBHelper}
                  />
                }
              />

              <FormControlLabel
                label="modules.dep Helper"
                control={
                  <Toggle
                    checked={helpers.modules_dep}
                    onChange={this.handleToggleModulesDepHelper}
                  />
                }
              />

              <FormControlLabel
                label="automount devtpmfs"
                control={
                  <Toggle
                    checked={helpers.devtmpfs_automount}
                    onChange={this.handleToggleAutoMountHelper}
                  />
                }
              />

              <FormControlLabel
                label="auto-configure networking"
                control={
                  <Toggle
                    checked={helpers.network}
                    onChange={this.handleAuthConfigureNetworkHelper}
                  />
                }
              />
            </FormGroup>
          </FormControl>
        </Grid>
        <Grid item>
          <ActionsPanel>
            <Button onClick={this.onSubmit} variant="raised" color="primary">Submit</Button>
            <Button
              variant="raised"
              color="secondary"
              className="cancel"
              onClick={onClose}
            >
              Cancel
              </Button>
          </ActionsPanel>
        </Grid>
      </React.Fragment>
    );
  };

  isOpening = (prevState: boolean, currentState: boolean) => prevState === false && currentState === true;

  getAvailableDevices = () => {
    const { linodeId, linodeRegion } = this.props;

    /** Get all volumes for usage in the block device assignment. */
    getAllVolumes()
      .then((volumes) => volumes.reduce((result, volume) => {
        /**
         * This is a combination of filter and map. Filter out irrelevant volumes, and update
         * volumes with the special _id property.
         */
        const isAttachedToLinode = volume.linode_id === linodeId;
        const isUnattached = volume.linode_id === null;
        const isInRegion = volume.region === linodeRegion;

        if (isAttachedToLinode || (isUnattached && isInRegion)) {
          const extendedVolume = { ...volume, _id: `volume-${volume.id}` };

          return [...result, extendedVolume];
        }

        return result;
      }, []))
      .then(volumes => this.setState({ availableDevices: { ...this.state.availableDevices, volumes } }))
      .catch(console.error);

    /** Get all Linode disks for usage in the block device assignment. */
    getAllLinodeDisks(linodeId)
      .then(disks => disks.map((disk) => ({ ...disk, _id: `disk-${disk.id}` })))
      .then(disks => this.setState({ availableDevices: { ...this.state.availableDevices, disks } }))
      .catch(console.error);
  }

  onSubmit = () => {
    const { linodeId, linodeConfigId } = this.props;

    /** Editing */
    if (linodeConfigId) {
      return updateLinodeConfig(linodeId, linodeConfigId, this.convertStateToData(this.state.fields))
        .then(({ data }) => {
          this.props.onClose();
          this.props.onSuccess();
        })
        .catch((error) => {
          this.setState({
            errors: pathOr([{ reason: 'Unable to update config. Please try again.' }], ['response', 'data', 'errors'], error)
          })
        })
    }

    /** Creating */
    return createLinodeConfig(linodeId, this.convertStateToData(this.state.fields))
      .then(response => {
        this.props.onClose();
        this.props.onSuccess();
      })
      .catch(error =>
        this.setState({
          errors: pathOr([{ reason: 'Unable to create config. Please try again.' }], ['response', 'data', 'errors'], error),
        }))
  };

  convertStateToData = (state: EditableFields) => {
    const {
      label,
      devices,
      kernel,
      comments,
      memory_limit,
      run_level,
      virt_mode,
      helpers,
      root_device,
    } = state;

    return {
      label,
      devices: createDevicesFromStrings(devices),
      kernel,
      comments,
      memory_limit,
      run_level,
      virt_mode,
      helpers,
      root_device,
    }
  };

  /** Helper to update a slice of state.  */
  updateField = (field: Partial<EditableFields>) =>
    this.setState({ fields: { ...this.state.fields, ...field } })

  handleAuthConfigureNetworkHelper = (e: any, result: boolean) =>
    this.updateField({ helpers: { ...this.state.fields.helpers, network: result } });

  handleToggleAutoMountHelper = (e: any, result: boolean) =>
    this.updateField({ helpers: { ...this.state.fields.helpers, devtmpfs_automount: result } });

  handleToggleModulesDepHelper = (e: any, result: boolean) =>
    this.updateField({ helpers: { ...this.state.fields.helpers, modules_dep: result } });

  handleToggleUpdateDBHelper = (e: any, result: boolean) =>
    this.updateField({ helpers: { ...this.state.fields.helpers, updatedb_disabled: result } });

  handleToggleDistroHelper = (e: any, result: boolean) =>
    this.updateField({ helpers: { ...this.state.fields.helpers, distro: result } });

  handleRootDeviceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ root_device: e.target.value || '' });

  handleUseCustomRootChange = (e: any, useCustomRoot: boolean) =>
    this.updateField({ useCustomRoot });

  handleDevicesChanges = (slot: string, value: string) =>
    this.updateField({ devices: { ...this.state.fields.devices, [slot]: value } });

  handleMemoryLimitChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ memory_limit: e.target.valueAsNumber || 0 });

  handleChangeRunLevel = (e: any, run_level: 'binbash' | 'default' | 'single') =>
    this.updateField({ run_level });

  handleChangeVirtMode = (e: any, virt_mode: 'fullvirt' | 'paravirt') =>
    this.updateField({ virt_mode });

  handleChangeComments = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ comments: e.target.value || '' });

  handleChangeKernel = (e: React.ChangeEvent<HTMLSelectElement>) =>
    this.updateField({ kernel: e.target.value });

  handleChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ label: e.target.value || '' });

  requestKernels = () => {
    this.setState({ loading: { ...this.state.loading, kernels: true } });

    return getAllKernels()
      .then((kernels) => {
        this.setState({
          kernels,
          loading: { ...this.state.loading, kernels: false },
        })
      })
      .catch(error => {
        this.setState({
          loading: { ...this.state.loading, kernels: false },
          errors: pathOr([{ reason: 'Unable to load kernesl.' }], ['response', 'data', 'errors'], error),
        })
      });
  };
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeConfigDrawer);

const isUsingCustomRoot = (value: string) => [
  '/dev/sda',
  '/dev/sdb',
  '/dev/sdc',
  '/dev/sdd',
  '/dev/sde',
  '/dev/sdf',
  '/dev/sdg',
  '/dev/sdh',
].includes(value) === false
