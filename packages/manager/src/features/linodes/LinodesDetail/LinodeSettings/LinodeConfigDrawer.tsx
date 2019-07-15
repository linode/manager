/**
 * @todo The config information is now immediately available on the LinodeDetail context and we
 * should source it directly from there rather than making an additional request. OR We can source
 * it from there and make the (thunk) request to get the latest/greatest information.
 */
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormGroup from 'src/components/core/FormGroup';
import FormLabel from 'src/components/core/FormLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import DeviceSelection, {
  ExtendedDisk,
  ExtendedVolume
} from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import { getLinodeKernels } from 'src/services/linodes';
import { ApplicationState } from 'src/store';
import createDevicesFromStrings, {
  DevicesAsStrings
} from 'src/utilities/createDevicesFromStrings';
import createStringsFromDevices from 'src/utilities/createStringsFromDevices';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import {
  CreateLinodeConfig,
  GetLinodeConfig,
  UpdateLinodeConfig,
  withLinodeDetailContext
} from '../linodeDetailContext';

type ClassNames = 'section' | 'divider';

const styles = (theme: Theme) =>
  createStyles({
    section: {
      marginTop: theme.spacing(2)
    },
    divider: {
      margin: `${theme.spacing(2)}px ${theme.spacing(1)}px 0 `,
      width: `calc(100% - ${theme.spacing(2)}px)`
    }
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
  setMemoryLimit: 'no_limit' | 'set_limit';
}

interface Props {
  linodeHypervisor: 'kvm' | 'xen';
  linodeRegion: string;
  maxMemory: number;
  open: boolean;
  linodeConfigId?: number;
  onClose: () => void;
}

interface State {
  loading: {
    kernels: boolean;
    config: boolean;
  };
  kernels: Linode.Kernel[];
  errors?: Error | Linode.ApiFieldError[];
  fields: EditableFields;
}

type CombinedProps = LinodeContextProps &
  Props &
  StateProps &
  WithStyles<ClassNames>;

const getAllKernels = getAll<Linode.Kernel>(getLinodeKernels);

class LinodeConfigDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    loading: {
      kernels: false,
      config: false
    },
    kernels: [],
    fields: LinodeConfigDrawer.defaultFieldsValues()
  };

  static defaultFieldsValues: () => EditableFields = () => ({
    comments: '',
    devices: {},
    helpers: {
      devtmpfs_automount: true,
      distro: true,
      modules_dep: true,
      network: true,
      updatedb_disabled: true
    },
    kernel: 'linode/latest-64bit',
    label: '',
    memory_limit: 0,
    root_device: '/dev/sda',
    run_level: 'default',
    useCustomRoot: false,
    virt_mode: 'paravirt',
    setMemoryLimit: 'no_limit'
  });

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { linodeConfigId, linodeHypervisor, getLinodeConfig } = this.props;

    if (this.isOpening(prevProps.open, this.props.open)) {
      /** Reset the form to the default create state. */
      this.setState({
        fields: LinodeConfigDrawer.defaultFieldsValues()
      });

      if (this.state.errors) {
        this.setState({ errors: undefined });
      }

      /**
       * Get all the kernels for usage in the Kernel selection menu.
       * @todo We could (should?) put this back into Redux.
       */
      if (prevState.kernels.length === 0) {
        this.requestKernels(linodeHypervisor);
      }

      if (linodeConfigId !== undefined) {
        this.setState({ loading: { ...this.state.loading, config: true } });

        getLinodeConfig(linodeConfigId)
          .then(config => {
            this.setState({
              loading: {
                ...this.state.loading,
                config: false
              },
              fields: {
                useCustomRoot: isUsingCustomRoot(config.root_device),
                label: config.label,
                devices: createStringsFromDevices(config.devices),
                kernel: config.kernel,
                comments: config.comments,
                memory_limit: config.memory_limit,
                run_level: config.run_level,
                virt_mode: config.virt_mode,
                helpers: config.helpers,
                root_device: config.root_device,
                setMemoryLimit:
                  config.memory_limit !== 0 ? 'set_limit' : 'no_limit'
              }
            });
          })
          .catch(error => {
            this.setState({
              errors: Error(),
              loading: { ...this.state.loading, config: false }
            });
          });
      }
      /**
       * If the linodeConfigId is set, we're editing, so we query to get the config data and
       * fill out the form with the data.
       */
    }
  }

  render() {
    const { open, onClose, linodeConfigId } = this.props;
    const { errors } = this.state;
    const loading = Object.values(this.state.loading).some(v => v === true);

    return (
      <Drawer
        title={`${linodeConfigId ? 'Edit' : 'Add'} Linode Configuration`}
        open={open}
        onClose={onClose}
      >
        <Grid container direction="row">
          {this.renderContent(errors, loading)}
        </Grid>
      </Drawer>
    );
  }

  renderContent = (
    errors: Error | Linode.ApiFieldError[] = [],
    loading: boolean
  ) => {
    if (errors instanceof Error) {
      return this.renderErrorState();
    }

    if (loading) {
      return this.renderLoading();
    }

    return this.renderForm(errors);
  };

  renderLoading = () => <CircleProgress />;

  renderErrorState = () => (
    <ErrorState errorText="Unable to load configurations." />
  );

  renderForm = (errors?: Linode.ApiFieldError[]) => {
    const { onClose, maxMemory, classes, readOnly } = this.props;

    const {
      kernels,
      fields: {
        useCustomRoot,
        label,
        kernel,
        comments,
        memory_limit,
        run_level,
        virt_mode,
        helpers,
        root_device
      }
    } = this.state;

    const errorFor = getAPIErrorsFor(
      {
        label: 'label',
        kernel: 'kernel',
        comments: 'comments',
        memory_limit: 'memory limit',
        run_level: 'run level',
        virt_mode: 'virtualization mode',
        root_device: 'root device'
      },
      errors
    );

    const generalError = errorFor('none');

    const availableDevices = {
      disks: this.props.disks,
      volumes: this.props.volumes
    };

    const kernelList = kernels.map(eachKernel => {
      return { label: eachKernel.label, value: eachKernel.id };
    });

    const pathsOptions = [
      { label: '/dev/sda', value: '/dev/sda' },
      { label: '/dev/sdb', value: '/dev/sdb' },
      { label: '/dev/sdc', value: '/dev/sdc' },
      { label: '/dev/sdd', value: '/dev/sdd' },
      { label: '/dev/sde', value: '/dev/sde' },
      { label: '/dev/sdf', value: '/dev/sdf' },
      { label: '/dev/sdg', value: '/dev/sdg' },
      { label: '/dev/sdh', value: '/dev/sdh' }
    ];

    return (
      <React.Fragment>
        {generalError && (
          <Notice error errorGroup="linode-config-drawer" text={generalError} />
        )}
        <Grid
          item
          xs={12}
          className={classes.section}
          updateFor={[
            errorFor('label'),
            errorFor('comments'),
            label,
            comments,
            classes
          ]}
        >
          <Typography variant="h3">Label and Comments</Typography>
          <TextField
            label="Label"
            required
            value={label}
            onChange={this.handleChangeLabel}
            errorText={errorFor('label')}
            errorGroup="linode-config-drawer"
            disabled={readOnly}
          />

          <TextField
            label="Comments"
            value={comments}
            onChange={this.handleChangeComments}
            multiline={true}
            rows={3}
            errorText={errorFor('comments')}
            errorGroup="linode-config-drawer"
            disabled={readOnly}
          />
        </Grid>

        <Divider className={classes.divider} />

        <Grid
          item
          xs={12}
          className={classes.section}
          updateFor={[virt_mode, classes]}
        >
          <Typography variant="h3">Virtual Machine</Typography>
          <FormControl>
            <FormLabel
              htmlFor="virt_mode"
              component="label"
              disabled={readOnly}
            >
              VM Mode
            </FormLabel>
            <RadioGroup
              aria-label="virt_mode"
              name="virt_mode"
              value={virt_mode}
              onChange={this.handleChangeVirtMode}
            >
              <FormControlLabel
                value="paravirt"
                label="Paravirtualization"
                disabled={readOnly}
                control={<Radio />}
              />
              <FormControlLabel
                value="fullvirt"
                label="Full virtualization"
                disabled={readOnly}
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Divider className={classes.divider} style={{ marginTop: 0 }} />

        <Grid
          item
          xs={12}
          className={classes.section}
          updateFor={[
            kernel,
            this.state.fields.setMemoryLimit,
            kernels,
            errorFor('kernel'),
            run_level,
            memory_limit,
            errorFor('memory_limit'),
            classes
          ]}
        >
          <Typography variant="h3">Boot Settings</Typography>
          {kernels && (
            <Select
              options={kernelList}
              label="Select a Kernel"
              defaultValue={kernelList.find(
                thisKernel => thisKernel.value === kernel
              )}
              onChange={this.handleChangeKernel}
              errorText={errorFor('kernel')}
              errorGroup="linode-config-drawer"
              disabled={readOnly}
              isClearable={false}
            />
          )}

          <FormControl
            updateFor={[run_level, classes]}
            fullWidth
            disabled={readOnly}
          >
            <FormLabel htmlFor="run_level" component="label">
              Run Level
            </FormLabel>
            <RadioGroup
              aria-label="run_level"
              name="run_level"
              value={run_level}
              onChange={this.handleChangeRunLevel}
            >
              <FormControlLabel
                value="default"
                label="Run Default Level"
                disabled={readOnly}
                control={<Radio />}
              />
              <FormControlLabel
                value="single"
                label="Single user mode"
                disabled={readOnly}
                control={<Radio />}
              />
              <FormControlLabel
                value="binbash"
                label="init=/bin/bash"
                disabled={readOnly}
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>

          {/*
            it's important to note here that if the memory limit
            is set to 0, this config is going to use 100% of the
            Linode's RAM. Otherwise, it only uses the limit
            explicitly set by the user.

            So to make this more clear to the user, we're going to
            hide the option to change the RAM limit unless the
            user explicity selects the option to change the
            memory limit.
          */}
          <FormControl updateFor={[this.state.fields.setMemoryLimit, classes]}>
            <FormLabel
              htmlFor="memory_limit"
              component="label"
              disabled={readOnly}
            >
              Memory Limit
            </FormLabel>
            <RadioGroup
              aria-label="memory_limit"
              name="memory_limit"
              value={this.state.fields.setMemoryLimit}
              onChange={this.handleToggleMemoryLimit}
            >
              <FormControlLabel
                value="no_limit"
                label="Do not set any limits on memory usage"
                disabled={readOnly}
                control={<Radio />}
              />
              <FormControlLabel
                value="set_limit"
                label="Limit the amount of RAM this config uses"
                disabled={readOnly}
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>

          {this.state.fields.setMemoryLimit === 'set_limit' && (
            <TextField
              type="number"
              label="Memory Limit Allotment (in MB)"
              // value={memory_limit}
              min={0}
              max={maxMemory}
              onChange={this.handleMemoryLimitChange}
              helperText={`Max: ${maxMemory} MB`}
              errorText={errorFor('memory_limit')}
              disabled={readOnly}
            />
          )}
        </Grid>

        <Divider className={classes.divider} />

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h3">Block Device Assignment</Typography>
          <DeviceSelection
            slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg', 'sdh']}
            devices={availableDevices}
            onChange={this.handleDevicesChanges}
            getSelected={slot => pathOr('', [slot], this.state.fields.devices)}
            counter={99}
            disabled={readOnly}
          />

          <FormControl fullWidth>
            <FormControlLabel
              label="Use Custom Root"
              control={
                <Toggle
                  checked={useCustomRoot}
                  onChange={this.handleUseCustomRootChange}
                  disabled={readOnly}
                />
              }
            />
            {!useCustomRoot ? (
              <Select
                options={pathsOptions}
                label="Root Device"
                defaultValue={pathsOptions.find(
                  device => device.value === root_device
                )}
                onChange={this.handleRootDeviceChange}
                name="root_device"
                id="root_device"
                errorText={errorFor('root_device')}
                placeholder="None"
                disabled={readOnly}
                isClearable={false}
              />
            ) : (
              <TextField
                label="Custom"
                value={root_device}
                onChange={this.handleRootDeviceChangeTextfield}
                inputProps={{ name: 'root_device', id: 'root_device' }}
                fullWidth
                autoFocus={true}
                errorText={errorFor('root_device')}
                errorGroup="linode-config-drawer"
                disabled={readOnly}
              />
            )}
          </FormControl>
        </Grid>

        <Divider className={classes.divider} />

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h3">Filesystem/Boot Helpers</Typography>
          <FormControl
            updateFor={[
              helpers.distro,
              helpers.updatedb_disabled,
              helpers.modules_dep,
              helpers.devtmpfs_automount,
              helpers.network,
              classes
            ]}
            fullWidth
          >
            <FormGroup>
              <FormControlLabel
                label="Distro Helper"
                control={
                  <Toggle
                    checked={helpers.distro}
                    onChange={this.handleToggleDistroHelper}
                    disabled={readOnly}
                  />
                }
              />

              <FormControlLabel
                label="Disable updatedb"
                control={
                  <Toggle
                    checked={helpers.updatedb_disabled}
                    onChange={this.handleToggleUpdateDBHelper}
                    disabled={readOnly}
                  />
                }
              />

              <FormControlLabel
                label="modules.dep Helper"
                control={
                  <Toggle
                    checked={helpers.modules_dep}
                    onChange={this.handleToggleModulesDepHelper}
                    disabled={readOnly}
                  />
                }
              />

              <FormControlLabel
                label="automount devtpmfs"
                control={
                  <Toggle
                    checked={helpers.devtmpfs_automount}
                    onChange={this.handleToggleAutoMountHelper}
                    disabled={readOnly}
                  />
                }
              />

              <FormControlLabel
                label="auto-configure networking"
                control={
                  <Toggle
                    checked={helpers.network}
                    onChange={this.handleAuthConfigureNetworkHelper}
                    disabled={readOnly}
                  />
                }
              />
            </FormGroup>
          </FormControl>
        </Grid>
        <Grid item>
          <ActionsPanel>
            <Button
              onClick={this.onSubmit}
              buttonType="primary"
              disabled={readOnly}
            >
              Submit
            </Button>
            <Button buttonType="secondary" className="cancel" onClick={onClose}>
              Cancel
            </Button>
          </ActionsPanel>
        </Grid>
      </React.Fragment>
    );
  };

  isOpening = (prevState: boolean, currentState: boolean) =>
    prevState === false && currentState === true;

  onSubmit = () => {
    const {
      linodeConfigId,
      createLinodeConfig,
      updateLinodeConfig
    } = this.props;

    /**
     * This is client-side validation to patch an API bug.
     * Currently, POST requests don't verify that the selected root device
     * has a valid device attached to it. PUT requests do this, however,
     * leading to a discrepancy. If root_device is sda and sda is null,
     * we should head off that error before submitting the request.
     * @todo remove once the API has fixed this behavior.
     */

    const isValid = validateConfigData(this.state.fields);
    if (!isValid) {
      return this.setState({
        errors: [
          {
            reason:
              'You must select a valid Disk or Volume as your root device.',
            field: 'root_device'
          }
        ]
      });
    }

    const configData = this.convertStateToData(this.state.fields);

    /** Editing */
    if (linodeConfigId) {
      return updateLinodeConfig(linodeConfigId, configData)
        .then(_ => {
          this.props.onClose();
        })
        .catch(error => {
          this.setState({
            errors: getAPIErrorOrDefault(
              error,
              'Unable to update config. Please try again.'
            )
          });
        });
    }

    /** Creating */
    return createLinodeConfig(configData)
      .then(_ => {
        this.props.onClose();
      })
      .catch(error =>
        this.setState({
          errors: getAPIErrorOrDefault(
            error,
            'Unable to create config. Please try again.'
          )
        })
      );
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
      setMemoryLimit,
      helpers,
      root_device
    } = state;

    return {
      label,
      devices: createDevicesFromStrings(devices),
      kernel,
      comments,
      /** if the user did not toggle the limit radio button, send a value of 0 */
      memory_limit: setMemoryLimit === 'no_limit' ? 0 : memory_limit,
      run_level,
      virt_mode,
      helpers,
      root_device
    };
  };

  /**
   * this is not responsible for setting the memory limits.
   * This is instead only responsible for indicating that "yes I would
   * like the option to set a memory limit to be visible."
   */
  handleToggleMemoryLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limit = e.target.value as 'no_limit' | 'set_limit';
    this.setState({ fields: { ...this.state.fields, setMemoryLimit: limit } });
  };

  /** Helper to update a slice of state.  */
  updateField = (field: Partial<EditableFields>) =>
    this.setState({ fields: { ...this.state.fields, ...field } });

  handleAuthConfigureNetworkHelper = (e: any, result: boolean) =>
    this.updateField({
      helpers: { ...this.state.fields.helpers, network: result }
    });

  handleToggleAutoMountHelper = (e: any, result: boolean) =>
    this.updateField({
      helpers: { ...this.state.fields.helpers, devtmpfs_automount: result }
    });

  handleToggleModulesDepHelper = (e: any, result: boolean) =>
    this.updateField({
      helpers: { ...this.state.fields.helpers, modules_dep: result }
    });

  handleToggleUpdateDBHelper = (e: any, result: boolean) =>
    this.updateField({
      helpers: { ...this.state.fields.helpers, updatedb_disabled: result }
    });

  handleToggleDistroHelper = (e: any, result: boolean) =>
    this.updateField({
      helpers: { ...this.state.fields.helpers, distro: result }
    });

  handleRootDeviceChange = (e: Item<string>) =>
    this.updateField({ root_device: e.value || '' });

  handleRootDeviceChangeTextfield = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ root_device: e.target.value || '' });

  handleUseCustomRootChange = (e: any, useCustomRoot: boolean) =>
    this.updateField({ useCustomRoot });

  handleDevicesChanges = (slot: string, value: string) =>
    this.updateField({
      devices: { ...this.state.fields.devices, [slot]: value }
    });

  handleMemoryLimitChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ memory_limit: e.target.valueAsNumber || 0 });

  handleChangeRunLevel = (
    e: any,
    run_level: 'binbash' | 'default' | 'single'
  ) => this.updateField({ run_level });

  handleChangeVirtMode = (e: any, virt_mode: 'fullvirt' | 'paravirt') =>
    this.updateField({ virt_mode });

  handleChangeComments = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ comments: e.target.value || '' });

  handleChangeKernel = (e: Item<string>) =>
    this.updateField({ kernel: e.value });

  handleChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.updateField({ label: e.target.value || '' });

  requestKernels = (linodeHypervisor: 'kvm' | 'xen') => {
    this.setState({ loading: { ...this.state.loading, kernels: true } });

    return getAllKernels({}, { [linodeHypervisor]: true })
      .then(({ data: kernels }) => {
        this.setState({
          kernels,
          loading: { ...this.state.loading, kernels: false }
        });
      })
      .catch(error => {
        this.setState({
          loading: { ...this.state.loading, kernels: false },
          errors: getAPIErrorOrDefault(error, 'Unable to load kernels.')
        });
      });
  };
}
const isUsingCustomRoot = (value: string) =>
  [
    '/dev/sda',
    '/dev/sdb',
    '/dev/sdc',
    '/dev/sdd',
    '/dev/sde',
    '/dev/sdf',
    '/dev/sdg',
    '/dev/sdh'
  ].includes(value) === false;

const validateConfigData = (configData: EditableFields) => {
  /**
   * Whatever disk is selected for root_disk can't have a value of null ('none'
   * in our form state).
   *
   */
  const rootDevice = pathOr('none', [0], configData.root_device.match(/sd./));
  const selectedDisk = pathOr('none', ['devices', rootDevice], configData);
  return selectedDisk !== 'none';
};

const styled = withStyles(styles);

interface StateProps {
  disks: ExtendedDisk[];
  volumes: ExtendedVolume[];
}

interface LinodeContextProps {
  linodeId: number;
  createLinodeConfig: CreateLinodeConfig;
  updateLinodeConfig: UpdateLinodeConfig;
  getLinodeConfig: GetLinodeConfig;
  readOnly: boolean;
}

const enhanced = compose<CombinedProps, Props>(
  styled,

  withLinodeDetailContext(
    ({ linode, createLinodeConfig, updateLinodeConfig, getLinodeConfig }) => ({
      disks: linode._disks.map((disk: Linode.Disk) => ({
        ...disk,
        _id: `disk-${disk.id}`
      })),
      linodeId: linode.id,
      readOnly: linode._permissions === 'read_only',
      createLinodeConfig,
      updateLinodeConfig,
      getLinodeConfig
    })
  ),

  connect((state: ApplicationState, ownProps: LinodeContextProps & Props) => {
    const { linodeId, linodeRegion } = ownProps;
    const { itemsById } = state.__resources.volumes;

    const volumes = Object.values(itemsById).reduce(
      (result: Linode.Volume[], volume: Linode.Volume) => {
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
      },
      []
    );
    return { volumes };
  })
);

export default enhanced(LinodeConfigDrawer);
