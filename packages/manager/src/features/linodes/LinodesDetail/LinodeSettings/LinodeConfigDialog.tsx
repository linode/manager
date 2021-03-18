import { Config, Disk, Interface, Kernel } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import { useFormik } from 'formik';
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
import FormHelperText from 'src/components/core/FormHelperText';
import FormLabel from 'src/components/core/FormLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import DeviceSelection, {
  ExtendedDisk,
  ExtendedVolume,
} from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import { ApplicationState } from 'src/store';
import createDevicesFromStrings, {
  DevicesAsStrings,
} from 'src/utilities/createDevicesFromStrings';
import createStringsFromDevices from 'src/utilities/createStringsFromDevices';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  CreateLinodeConfig,
  UpdateLinodeConfig,
  withLinodeDetailContext,
} from '../linodeDetailContext';
import KernelSelect from './KernelSelect';
import InterfaceSelect, { ExtendedInterface } from './InterfaceSelect';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginTop: theme.spacing(),
  },
  section: {
    marginTop: theme.spacing(2),
  },
  divider: {
    margin: `${theme.spacing(2)}px ${theme.spacing(1)}px 0 `,
    width: `calc(100% - ${theme.spacing(2)}px)`,
  },
  formControlToggle: {
    '& button': {
      order: 3,
    },
  },
}));

interface Helpers {
  updatedb_disabled: boolean;
  distro: boolean;
  modules_dep: boolean;
  network: boolean;
  devtmpfs_automount: boolean;
}

type RunLevel = 'default' | 'single' | 'binbash';
type VirtMode = 'fullvirt' | 'paravirt';
type MemoryLimit = 'no_limit' | 'set_limit';

interface EditableFields {
  useCustomRoot: boolean;
  label: string;
  devices: DevicesAsStrings;
  kernel?: string;
  comments?: string;
  memory_limit?: number;
  run_level?: RunLevel;
  virt_mode?: VirtMode;
  helpers: Helpers;
  root_device: string;
  setMemoryLimit: MemoryLimit;
  interfaces: ExtendedInterface[];
}

interface Props {
  linodeHypervisor: 'kvm' | 'xen';
  linodeRegion: string;
  maxMemory: number;
  open: boolean;
  linodeConfigId?: number;
  onClose: () => void;
  kernels: Kernel[];
  kernelError: APIError[] | null;
  kernelsLoading: boolean;
}

type CombinedProps = LinodeContextProps & Props & StateProps;

const defaultInterfaces = [
  { purpose: 'public', label: '', ipam_address: '' },
  { purpose: 'none', label: '', ipam_address: '' },
  { purpose: 'none', label: '', ipam_address: '' },
] as ExtendedInterface[];

const defaultFieldsValues = {
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
  interfaces: defaultInterfaces,
  label: '',
  memory_limit: 0,
  root_device: '/dev/sda',
  run_level: 'default' as RunLevel,
  useCustomRoot: false,
  virt_mode: 'paravirt' as VirtMode,
  setMemoryLimit: 'no_limit' as MemoryLimit,
};

const pathsOptions = [
  { label: '/dev/sda', value: '/dev/sda' },
  { label: '/dev/sdb', value: '/dev/sdb' },
  { label: '/dev/sdc', value: '/dev/sdc' },
  { label: '/dev/sdd', value: '/dev/sdd' },
  { label: '/dev/sde', value: '/dev/sde' },
  { label: '/dev/sdf', value: '/dev/sdf' },
  { label: '/dev/sdg', value: '/dev/sdg' },
  { label: '/dev/sdh', value: '/dev/sdh' },
];

const LinodeConfigDialog: React.FC<CombinedProps> = (props) => {
  const {
    open,
    onClose,
    config,
    kernels,
    linodeConfigId,
    maxMemory,
    readOnly,
  } = props;

  const classes = useStyles();
  const [deviceCounter, setDeviceCounter] = React.useState(1);

  const { values, resetForm, setFieldValue, ...formik } = useFormik({
    initialValues: defaultFieldsValues,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values) => onSubmit(values),
  });

  const convertStateToData = (state: EditableFields) => {
    const {
      label,
      devices,
      kernel,
      comments,
      memory_limit,
      run_level,
      virt_mode,
      setMemoryLimit,
      interfaces,
      helpers,
      root_device,
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
      // Remove empty interfaces from the payload
      interfaces: interfaces.filter(
        (thisInterface) => thisInterface.purpose !== 'none'
      ) as Interface[],
      helpers,
      root_device,
    };
  };

  const onSubmit = (values: EditableFields) => {
    const { linodeConfigId, createLinodeConfig, updateLinodeConfig } = props;

    formik.setSubmitting(true);

    const configData = convertStateToData(values);

    alert(JSON.stringify(configData));

    const handleSuccess = () => {
      formik.setSubmitting(false);
      onClose();
    };

    const handleError = (error: APIError[]) => {
      const mapErrorToStatus = (generalError: string) =>
        formik.setStatus({ generalError });
      formik.setSubmitting(false);
      handleFieldErrors(formik.setErrors, error);
      handleGeneralErrors(
        mapErrorToStatus,
        error,
        'An unexpected error occurred.'
      );
      scrollErrorIntoView('linode-config-dialog');
    };

    /** Editing */
    if (linodeConfigId) {
      return updateLinodeConfig(linodeConfigId, configData)
        .then(handleSuccess)
        .catch(handleError);
    }

    /** Creating */
    return createLinodeConfig(configData)
      .then(handleSuccess)
      .catch(handleError);
  };

  React.useEffect(() => {
    if (open) {
      /**
       * If config is defined, we're editing. Set the state
       * to the values of the config.
       */
      if (config) {
        const devices = createStringsFromDevices(config.devices);
        const initialCounter = Object.keys(devices).length;
        setDeviceCounter(initialCounter);
        resetForm({
          values: {
            useCustomRoot: isUsingCustomRoot(config.root_device),
            label: config.label,
            devices,
            kernel: config.kernel,
            comments: config.comments,
            memory_limit: config.memory_limit,
            run_level: config.run_level,
            virt_mode: config.virt_mode,
            helpers: config.helpers,
            root_device: config.root_device,
            interfaces: config.interfaces,
            setMemoryLimit:
              config.memory_limit !== 0 ? 'set_limit' : 'no_limit',
          },
        });
      } else {
        // Create mode; make sure loading/error states are cleared.
        resetForm({ values: defaultFieldsValues });
      }
    }
  }, [open, config, resetForm]);

  const isLoading = props.kernelsLoading;

  const generalError = formik.status?.generalError;

  const availableDevices = {
    disks: props.disks,
    volumes: props.volumes,
  };

  /**
   * Form change handlers
   * (where formik.handleChange is insufficient)
   */

  const handleChangeKernel = React.useCallback(
    (selected: Item<string>) => {
      setFieldValue('kernel', selected?.value ?? '');
    },
    [setFieldValue]
  );

  const handleDevicesChanges = React.useCallback(
    (slot: string, value: string) => {
      setFieldValue(`devices[${slot}]`, value);
    },
    [setFieldValue]
  );

  const handleInterfaceChange = React.useCallback(
    (slot: number, updatedInterface: Interface) => {
      setFieldValue(`interfaces[${slot}]`, updatedInterface);
    },
    [setFieldValue]
  );

  return (
    <Dialog
      title={`${linodeConfigId ? 'Edit' : 'Add'} Linode Configuration`}
      open={open}
      onClose={onClose}
      fullHeight
      fullWidth
    >
      <Grid container direction="row">
        <DialogContent loading={isLoading} errors={props.kernelError}>
          <React.Fragment>
            {generalError && (
              <Grid item>
                <Notice
                  error
                  errorGroup="linode-config-dialog"
                  text={generalError}
                  spacingBottom={0}
                />
              </Grid>
            )}
            <Grid
              item
              xs={12}
              updateFor={[
                formik.errors.label,
                formik.errors.comments,
                values.label,
                values.comments,
                formik.handleChange,
                classes,
              ]}
            >
              <Typography variant="h3">Label and Comments</Typography>
              <TextField
                label="Label"
                name="label"
                required
                value={values.label}
                onChange={formik.handleChange}
                errorText={formik.errors.label}
                errorGroup="linode-config-dialog"
                disabled={readOnly}
              />

              <TextField
                label="Comments"
                name="comments"
                value={values.comments}
                onChange={formik.handleChange}
                multiline={true}
                rows={3}
                errorText={formik.errors.comments}
                errorGroup="linode-config-dialog"
                disabled={readOnly}
              />
            </Grid>

            <Divider className={classes.divider} />

            <Grid
              item
              xs={12}
              className={classes.section}
              updateFor={[values.virt_mode, classes]}
            >
              <Typography variant="h3">Virtual Machine</Typography>
              <FormControl>
                <FormLabel
                  htmlFor="virt_mode"
                  component="label"
                  disabled={readOnly}
                  aria-describedby="virtModeCaption"
                >
                  VM Mode
                </FormLabel>
                <RadioGroup
                  aria-label="virt_mode"
                  name="virt_mode"
                  value={values.virt_mode}
                  onChange={formik.handleChange}
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
                  <FormHelperText id="virtModeCaption">
                    Controls if devices inside your virtual machine are
                    paravirtualized or fully virtualized. Paravirt is what you
                    want, unless you&apos;re doing weird things.
                  </FormHelperText>
                </RadioGroup>
              </FormControl>
            </Grid>

            <Divider className={classes.divider} style={{ marginTop: 0 }} />

            <Grid
              item
              xs={12}
              className={classes.section}
              updateFor={[
                deviceCounter,
                values.kernel,
                values.setMemoryLimit,
                kernels,
                formik.errors.kernel,
                values.run_level,
                values.memory_limit,
                formik.errors.memory_limit,
                classes,
              ]}
            >
              <Typography variant="h3">Boot Settings</Typography>
              {kernels && (
                <KernelSelect
                  kernels={kernels}
                  selectedKernel={values.kernel}
                  onChange={handleChangeKernel}
                  readOnly={readOnly}
                  errorText={formik.errors.kernel}
                />
              )}

              <FormControl
                updateFor={[values.run_level, classes]}
                fullWidth
                disabled={readOnly}
              >
                <FormLabel htmlFor="run_level" component="label">
                  Run Level
                </FormLabel>
                <RadioGroup
                  aria-label="run_level"
                  name="run_level"
                  value={values.run_level}
                  onChange={formik.handleChange}
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
              <FormControl updateFor={[values.setMemoryLimit, classes]}>
                <FormLabel
                  htmlFor="memory_limit"
                  component="label"
                  disabled={readOnly}
                >
                  Memory Limit
                </FormLabel>
                <RadioGroup
                  aria-label="memory_limit"
                  name="setMemoryLimit"
                  value={values.setMemoryLimit}
                  onChange={formik.handleChange}
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

              {values.setMemoryLimit === 'set_limit' && (
                <TextField
                  type="number"
                  name="memory_limit"
                  label="Memory Limit Allotment (in MB)"
                  value={values.memory_limit}
                  min={0}
                  max={maxMemory}
                  onChange={formik.handleChange}
                  helperText={`Max: ${maxMemory} MB`}
                  errorText={formik.errors.memory_limit}
                  disabled={readOnly}
                />
              )}
            </Grid>

            <Divider className={classes.divider} />

            <Grid item xs={12} className={classes.section}>
              <Typography variant="h3">Block Device Assignment</Typography>
              <DeviceSelection
                counter={deviceCounter}
                slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg', 'sdh']}
                devices={availableDevices}
                onChange={handleDevicesChanges}
                getSelected={(slot) => pathOr('', [slot], values.devices)}
                disabled={readOnly}
              />
              <Button
                className={classes.button}
                buttonType="secondary"
                superCompact
                onClick={() => setDeviceCounter((counter) => counter + 1)}
                disabled={readOnly || deviceCounter >= 6}
              >
                Add a Device
              </Button>

              <FormControl fullWidth>
                <FormControlLabel
                  label="Use Custom Root"
                  name="useCustomRoot"
                  control={
                    <Toggle
                      checked={values.useCustomRoot}
                      onChange={formik.handleChange}
                      disabled={readOnly}
                    />
                  }
                />
                {!values.useCustomRoot ? (
                  <Select
                    options={pathsOptions}
                    label="Root Device"
                    defaultValue={pathsOptions.find(
                      (device) => device.value === values.root_device
                    )}
                    onChange={formik.handleChange}
                    name="root_device"
                    id="root_device"
                    errorText={formik.errors.root_device}
                    placeholder="None"
                    disabled={readOnly}
                    isClearable={false}
                  />
                ) : (
                  <TextField
                    label="Custom"
                    name="root_device"
                    value={values.root_device}
                    onChange={formik.handleChange}
                    inputProps={{ name: 'root_device', id: 'root_device' }}
                    fullWidth
                    errorText={formik.errors.root_device}
                    errorGroup="linode-config-dialog"
                    disabled={readOnly}
                  />
                )}
              </FormControl>
            </Grid>

            <Divider className={classes.divider} />

            <Grid item xs={12} className={classes.section}>
              <Typography variant="h3">Network Interfaces</Typography>
              {values.interfaces.map((thisInterface, idx, arr) =>
                // Magic so that we show interfaces that have been filled plus one more
                arr[idx - 1]?.purpose !== 'none' ||
                thisInterface.purpose !== 'none' ? (
                  <InterfaceSelect
                    key={`eth${idx}-interface`}
                    slotNumber={idx}
                    readOnly={readOnly}
                    error={formik.errors[`interfaces[${idx}]`]}
                    label={thisInterface.label}
                    purpose={thisInterface.purpose}
                    ipamAddress={thisInterface.ipam_address}
                    handleChange={(newInterface: Interface) =>
                      handleInterfaceChange(idx, newInterface)
                    }
                  />
                ) : null
              )}
            </Grid>

            <Divider className={classes.divider} />

            <Grid item xs={12} className={classes.section}>
              <Typography variant="h3">Filesystem/Boot Helpers</Typography>
              <FormControl
                updateFor={[
                  values.helpers.distro,
                  values.helpers.updatedb_disabled,
                  values.helpers.modules_dep,
                  values.helpers.devtmpfs_automount,
                  values.helpers.network,
                  classes,
                ]}
                fullWidth
              >
                <FormGroup>
                  <FormControlLabel
                    label="Enable distro helper"
                    name="helpers.distro"
                    className={classes.formControlToggle}
                    control={
                      <Toggle
                        checked={values.helpers.distro}
                        onChange={formik.handleChange}
                        disabled={readOnly}
                        tooltipText="Helps maintain correct inittab/upstart console device"
                      />
                    }
                  />

                  <FormControlLabel
                    label="Disable updatedb"
                    name="helpers.updatedb_disabled"
                    className={classes.formControlToggle}
                    control={
                      <Toggle
                        checked={values.helpers.updatedb_disabled}
                        onChange={formik.handleChange}
                        disabled={readOnly}
                        tooltipText="Disables updatedb cron job to avoid disk thrashing"
                      />
                    }
                  />

                  <FormControlLabel
                    label="Enable modules.dep helper"
                    name="helpers.modules_dep"
                    className={classes.formControlToggle}
                    control={
                      <Toggle
                        checked={values.helpers.modules_dep}
                        onChange={formik.handleChange}
                        disabled={readOnly}
                        tooltipText="Creates a modules dependency file for the kernel you run"
                      />
                    }
                  />

                  <FormControlLabel
                    label="Auto-mount devtmpfs"
                    name="helpers.devtmpfs_automount"
                    className={classes.formControlToggle}
                    control={
                      <Toggle
                        checked={values.helpers.devtmpfs_automount}
                        onChange={formik.handleChange}
                        disabled={readOnly}
                        tooltipText="Controls if pv_ops kernels automount devtmpfs at boot"
                      />
                    }
                  />

                  <FormControlLabel
                    label="Auto-configure networking"
                    name="helpers.network"
                    className={classes.formControlToggle}
                    control={
                      <Toggle
                        checked={values.helpers.network}
                        onChange={formik.handleChange}
                        disabled={readOnly}
                        tooltipText={
                          <>
                            Automatically configure static networking
                            <ExternalLink
                              text="(more info)"
                              link="https://www.linode.com/docs/platform/network-helper/"
                            />
                          </>
                        }
                        interactive={true}
                      />
                    }
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item>
              <ActionsPanel>
                <Button
                  onClick={formik.submitForm}
                  buttonType="primary"
                  disabled={readOnly}
                  loading={formik.isSubmitting}
                >
                  Submit
                </Button>
                <Button
                  buttonType="secondary"
                  className="cancel"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </ActionsPanel>
            </Grid>
          </React.Fragment>
        </DialogContent>
      </Grid>
    </Dialog>
  );
};

interface ConfigFormProps {
  loading: boolean;
  errors: APIError[] | null;
  children: JSX.Element;
}

const DialogContent: React.FC<ConfigFormProps> = (props) => {
  const { loading, errors } = props;

  if (loading) {
    return <CircleProgress />;
  }

  if (errors) {
    return <ErrorState errorText="Unable to load configurations." />;
  }

  return props.children;
};

const isUsingCustomRoot = (value: string) =>
  [
    '/dev/sda',
    '/dev/sdb',
    '/dev/sdc',
    '/dev/sdd',
    '/dev/sde',
    '/dev/sdf',
    '/dev/sdg',
    '/dev/sdh',
  ].includes(value) === false;

interface StateProps {
  disks: ExtendedDisk[];
  volumes: ExtendedVolume[];
  config?: Config;
}

interface LinodeContextProps {
  linodeId: number;
  createLinodeConfig: CreateLinodeConfig;
  updateLinodeConfig: UpdateLinodeConfig;
  readOnly: boolean;
}

const enhanced = compose<CombinedProps, Props>(
  withLinodeDetailContext(
    ({ linode, createLinodeConfig, updateLinodeConfig }) => ({
      disks: linode._disks.map((disk: Disk) => ({
        ...disk,
        _id: `disk-${disk.id}`,
      })),
      linodeId: linode.id,
      readOnly: linode._permissions === 'read_only',
      createLinodeConfig,
      updateLinodeConfig,
    })
  ),

  connect((state: ApplicationState, ownProps: LinodeContextProps & Props) => {
    const { linodeConfigId, linodeId, linodeRegion } = ownProps;
    const { itemsById } = state.__resources.volumes;

    const config = linodeConfigId
      ? state.__resources.linodeConfigs[linodeId].itemsById[linodeConfigId]
      : undefined;

    const volumes = Object.values(itemsById).reduce(
      (result: Volume[], volume: Volume) => {
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
    return { config, volumes };
  })
);

export default enhanced(LinodeConfigDialog);
