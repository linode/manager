import {
  Config,
  Interface,
  LinodeConfigCreationData,
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { equals, pathOr, repeat } from 'ramda';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { makeStyles } from 'tss-react/mui';

import { StyledActionPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Divider } from 'src/components/Divider';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormGroup from 'src/components/core/FormGroup';
import FormHelperText from 'src/components/core/FormHelperText';
import FormLabel from 'src/components/core/FormLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import DeviceSelection from 'src/features/Linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import { titlecase } from 'src/features/Linodes/presentation';
import {
  useLinodeConfigCreateMutation,
  useLinodeConfigUpdateMutation,
} from 'src/queries/linodes/configs';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import {
  useAllLinodeKernelsQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions';
import { queryKey as vlansQueryKey } from 'src/queries/vlans';
import { useAllVolumesQuery } from 'src/queries/volumes';
import createDevicesFromStrings, {
  DevicesAsStrings,
} from 'src/utilities/createDevicesFromStrings';
import createStringsFromDevices from 'src/utilities/createStringsFromDevices';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import InterfaceSelect, {
  ExtendedInterface,
} from '../LinodeSettings/InterfaceSelect';
import KernelSelect from '../LinodeSettings/KernelSelect';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    marginLeft: 1,
    marginTop: theme.spacing(),
  },
  divider: {
    margin: '36px 8px 12px',
    width: `calc(100% - ${theme.spacing(2)})`,
  },
  formControlToggle: {
    '& button': {
      color: theme.textColors.tableHeader,
      order: 3,
    },
  },
  formGroup: {
    '&.MuiFormGroup-root[role="radiogroup"]': {
      marginBottom: 0,
    },
    alignItems: 'flex-start',
  },
  tooltip: {
    maxWidth: 350,
  },
}));

interface Helpers {
  devtmpfs_automount: boolean;
  distro: boolean;
  modules_dep: boolean;
  network: boolean;
  updatedb_disabled: boolean;
}

type RunLevel = 'binbash' | 'default' | 'single';
type VirtMode = 'fullvirt' | 'paravirt';
type MemoryLimit = 'no_limit' | 'set_limit';

interface EditableFields {
  comments?: string;
  devices: DevicesAsStrings;
  helpers: Helpers;
  initrd: null | number | string;
  interfaces: ExtendedInterface[];
  kernel?: string;
  label: string;
  memory_limit?: number;
  root_device: string;
  run_level?: RunLevel;
  setMemoryLimit: MemoryLimit;
  useCustomRoot: boolean;
  virt_mode?: VirtMode;
}

interface Props {
  config: Config | undefined;
  isReadOnly: boolean;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

const defaultInterface = {
  ipam_address: '',
  label: '',
  purpose: 'none',
} as ExtendedInterface;

/**
 * We want to pad the interface list in the UI with purpose.none
 * interfaces up to the maximum (currently 3); any purpose.none
 * interfaces will be removed from the payload before submission,
 * they are only used as placeholders presented to the user as empty selects.
 */
export const padList = <T,>(list: T[], filler: T, size: number = 3): T[] => {
  return [...list, ...repeat(filler, Math.max(0, size - list.length))];
};

const padInterfaceList = (interfaces: ExtendedInterface[]) => {
  return padList<ExtendedInterface>(interfaces, defaultInterface, 3);
};

const defaultInterfaceList = padInterfaceList([
  {
    ipam_address: '',
    label: '',
    purpose: 'public',
  },
]);

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
  initrd: '',
  interfaces: defaultInterfaceList,
  kernel: 'linode/latest-64bit',
  label: '',
  memory_limit: 0,
  root_device: '/dev/sda',
  run_level: 'default' as RunLevel,
  setMemoryLimit: 'no_limit' as MemoryLimit,
  useCustomRoot: false,
  virt_mode: 'paravirt' as VirtMode,
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

const interfacesToState = (interfaces?: Interface[]) => {
  if (!interfaces || interfaces.length === 0) {
    return defaultInterfaceList;
  }
  const interfacesPayload = interfaces.map(
    ({ ipam_address, label, purpose }) => ({ ipam_address, label, purpose })
  );
  return padInterfaceList(interfacesPayload);
};

const interfacesToPayload = (interfaces?: ExtendedInterface[]) => {
  if (!interfaces || interfaces.length === 0) {
    return [];
  }
  return equals(interfaces, defaultInterfaceList)
    ? // In this case, where eth0 is set to public interface
      // and no other interfaces are specified, the API prefers
      // to receive an empty array.
      []
    : (interfaces.filter(
        (thisInterface) => thisInterface.purpose !== 'none'
      ) as Interface[]);
};

const deviceSlots = ['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg', 'sdh'];
const deviceCounterDefault = 1;

// DiskID reserved on the back-end to indicate Finnix.
const finnixDiskID = 25669;

export const LinodeConfigDialog = (props: Props) => {
  const { config, isReadOnly, linodeId, onClose, open } = props;

  const { data: linode } = useLinodeQuery(linodeId);

  const {
    data: kernels,
    error: kernelsError,
    isLoading: kernelsLoading,
  } = useAllLinodeKernelsQuery(
    {},
    { [linode?.hypervisor ?? 'kvm']: true },
    open && linode !== undefined
  );

  const { data: disks } = useAllLinodeDisksQuery(linodeId);

  const initrdFromConfig = config?.initrd ? String(config.initrd) : '';

  const { mutateAsync: createConfig } = useLinodeConfigCreateMutation(linodeId);
  const { mutateAsync: updateConfig } = useLinodeConfigUpdateMutation(
    linodeId,
    config?.id ?? -1
  );

  const { classes } = useStyles();
  const regions = useRegionsQuery().data ?? [];

  const queryClient = useQueryClient();

  const [deviceCounter, setDeviceCounter] = React.useState(
    deviceCounterDefault
  );

  const [useCustomRoot, setUseCustomRoot] = React.useState(false);

  const regionHasVLANS = regions.some(
    (thisRegion) =>
      thisRegion.id === linode?.region &&
      thisRegion.capabilities.includes('Vlans')
  );

  const showVlans = regionHasVLANS;

  const { resetForm, setFieldValue, values, ...formik } = useFormik({
    initialValues: defaultFieldsValues,
    onSubmit: (values) => onSubmit(values),
    validate: (values) => onValidate(values),
    validateOnChange: false,
    validateOnMount: false,
  });

  const convertStateToData = (
    state: EditableFields
  ): LinodeConfigCreationData => {
    const {
      comments,
      devices,
      helpers,
      initrd,
      interfaces,
      kernel,
      label,
      memory_limit,
      root_device,
      run_level,
      setMemoryLimit,
      virt_mode,
    } = state;

    return {
      comments,
      devices: createDevicesFromStrings(devices),
      helpers,
      initrd: initrd !== '' ? initrd : null,
      interfaces: interfacesToPayload(interfaces),
      kernel,
      label,
      /** if the user did not toggle the limit radio button, send a value of 0 */
      memory_limit: setMemoryLimit === 'no_limit' ? 0 : memory_limit,
      root_device,
      run_level,
      virt_mode,
    };
  };

  // This validation runs BEFORE Yup schema validation. This validation logic
  // is specific to Cloud Manager, which is why it is run separately (not in the
  // shared Validation package).
  const onValidate = (values: EditableFields) => {
    const errors: any = {};
    const { interfaces } = values;

    const eth1 = interfaces[1];
    const eth2 = interfaces[2];

    if (eth1?.purpose === 'none' && eth2.purpose !== 'none') {
      errors.interfaces =
        'You cannot assign an interface to eth2 without an interface assigned to eth1.';
      return errors;
    }

    // The API field is called "label" and thus the Validation package error
    // message is "Label is required." Our field in Cloud is called "VLAN".
    interfaces.forEach((thisInterface, idx) => {
      if (thisInterface.purpose === 'vlan' && !thisInterface.label) {
        errors[`interfaces[${idx}].label`] = 'VLAN is required.';
      }
    });

    return errors;
  };

  const onSubmit = (values: EditableFields) => {
    formik.setSubmitting(true);

    const configData = convertStateToData(values) as LinodeConfigCreationData;

    // If Finnix was selected, make sure it gets sent as a number in the payload, not a string.
    if (Number(configData.initrd) === finnixDiskID) {
      configData.initrd = finnixDiskID;
    }

    if (!regionHasVLANS) {
      delete configData.interfaces;
    }

    const handleSuccess = () => {
      formik.setSubmitting(false);
      queryClient.invalidateQueries(['linode', 'configs', props.linodeId]);
      // If there's any chance a VLAN changed here, make sure our query data is up to date
      if (
        configData.interfaces?.some(
          (thisInterface) => thisInterface.purpose === 'vlan'
        )
      ) {
        queryClient.invalidateQueries('vlans');
      }
      onClose();
    };

    const handleError = (error: APIError[]) => {
      const mapErrorToStatus = (generalError: string) =>
        formik.setStatus({ generalError });

      // override 'disk_id' and 'volume_id' value for 'field' key with 'devices' to map and surface errors appropriately
      const overrideFieldForDevices = (error: APIError[]) => {
        error.forEach((err) => {
          if (err.field && ['disk_id', 'volume_id'].includes(err.field)) {
            err.field = 'devices';
          }
        });
      };

      formik.setSubmitting(false);

      overrideFieldForDevices(error);

      handleFieldErrors(formik.setErrors, error);

      handleGeneralErrors(
        mapErrorToStatus,
        error,
        'An unexpected error occurred.'
      );
      scrollErrorIntoView('linode-config-dialog');
    };

    /** Editing */
    if (config) {
      return updateConfig(configData).then(handleSuccess).catch(handleError);
    }

    /** Creating */
    return createConfig(configData).then(handleSuccess).catch(handleError);
  };

  React.useEffect(() => {
    if (open) {
      // Ensure VLANs are fresh.
      queryClient.invalidateQueries(vlansQueryKey);

      /**
       * If config is defined, we're editing. Set the state
       * to the values of the config.
       */
      if (config) {
        const devices = createStringsFromDevices(config.devices);

        /*
        If device slots are populated out of sequential order (e.g. sda and sdb are assigned
        but no others are until sdf), ascertain the last assigned slot to determine how many
        device slots to display initially.
        */
        const assignedDevices = Object.keys(devices);
        const lastAssignedDeviceSlot =
          assignedDevices[assignedDevices.length - 1];

        const positionInSequentialSlots = deviceSlots.indexOf(
          lastAssignedDeviceSlot
        );

        setDeviceCounter(positionInSequentialSlots);

        setUseCustomRoot(
          !pathsOptions.some(
            (thisOption) => thisOption.value === config?.root_device
          )
        );

        resetForm({
          values: {
            comments: config.comments,
            devices,
            helpers: config.helpers,
            initrd: initrdFromConfig,
            interfaces: interfacesToState(config.interfaces),
            kernel: config.kernel,
            label: config.label,
            memory_limit: config.memory_limit,
            root_device: config.root_device,
            run_level: config.run_level,
            setMemoryLimit:
              config.memory_limit !== 0 ? 'set_limit' : 'no_limit',
            useCustomRoot: isUsingCustomRoot(config.root_device),
            virt_mode: config.virt_mode,
          },
        });
      } else {
        // Create mode; make sure loading/error states are cleared.
        resetForm({ values: defaultFieldsValues });
        setUseCustomRoot(false);
        setDeviceCounter(deviceCounterDefault);
      }
    }
  }, [open, config, initrdFromConfig, resetForm]);

  const generalError = formik.status?.generalError;

  // We need the API to allow us to filter on `linode_id`
  // const { data: volumes } = useAllVolumesQuery(
  //   {},
  //   {
  //     '+or': [
  //       { linode_id: props.linodeId },
  //       { linode_id: null, region: linodeRegion },
  //     ],
  //   },
  //   open
  // );

  const { data: volumesData } = useAllVolumesQuery(
    {},
    { region: linode?.region },
    open
  );

  const volumes =
    volumesData?.filter((volume) => {
      const isAttachedToLinode = volume.linode_id === props.linodeId;
      const isUnattached = volume.linode_id === null;

      return isAttachedToLinode || isUnattached;
    }) ?? [];

  const availableDevices = {
    disks:
      disks?.map((disk) => ({
        ...disk,
        _id: `disk-${disk.id}`,
      })) ?? [],
    volumes: volumes.map((volume) => ({
      ...volume,
      _id: `volume-${volume.id}`,
    })),
  };

  const initrdDisks = availableDevices.disks.filter(
    (disk) => disk.filesystem === 'initrd'
  );

  const initrdDisksObject = {
    disks: initrdDisks,
  };

  const categorizedInitrdOptions = Object.entries(initrdDisksObject).map(
    ([category, items]) => {
      const categoryTitle = titlecase(category);
      return {
        label: categoryTitle,
        options: [
          ...items.map(({ id, label }) => {
            return {
              label,
              value: String(id) as null | number | string,
            };
          }),
          { label: 'Recovery – Finnix (initrd)', value: String(finnixDiskID) },
        ],
        value: category,
      };
    }
  );

  categorizedInitrdOptions.unshift({
    label: '',
    options: [{ label: 'None', value: null }],
    value: '',
  });

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
      formik.setFieldError('devices', '');
    },
    [setFieldValue, formik]
  );

  const handleInterfaceChange = React.useCallback(
    (slot: number, updatedInterface: Interface) => {
      setFieldValue(`interfaces[${slot}]`, updatedInterface);
    },
    [setFieldValue]
  );

  const handleToggleCustomRoot = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUseCustomRoot(e.target.checked);
      if (!e.target.checked) {
        // Toggling from custom to standard; reset any custom input
        setFieldValue('root_device', pathsOptions[0].value);
      }
    },
    [setUseCustomRoot, setFieldValue]
  );

  const handleRootDeviceChange = React.useCallback(
    (selected: Item<string>) => {
      setFieldValue('root_device', selected.value);
    },
    [setFieldValue]
  );

  const handleInitrdChange = React.useCallback(
    (selectedDisk: Item<string>) => {
      setFieldValue('initrd', selectedDisk.value);
    },
    [setFieldValue]
  );

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={onClose}
      open={open}
      title={`${config ? 'Edit' : 'Add'} Configuration`}
    >
      <Grid container direction="row">
        <DialogContent errors={kernelsError} loading={kernelsLoading}>
          <React.Fragment>
            {generalError && (
              <Grid>
                <Notice
                  error
                  errorGroup="linode-config-dialog"
                  spacingBottom={0}
                  text={generalError}
                />
              </Grid>
            )}
            <Grid xs={12}>
              <TextField
                disabled={isReadOnly}
                errorGroup="linode-config-dialog"
                errorText={formik.errors.label}
                label="Label"
                name="label"
                onChange={formik.handleChange}
                required
                value={values.label}
              />

              <TextField
                disabled={isReadOnly}
                errorGroup="linode-config-dialog"
                errorText={formik.errors.comments}
                label="Comments"
                multiline={true}
                name="comments"
                onChange={formik.handleChange}
                rows={1.5}
                value={values.comments}
              />
            </Grid>

            <Divider className={classes.divider} />

            <Grid xs={12}>
              <Typography variant="h3">Virtual Machine</Typography>
              <FormControl>
                <FormLabel
                  aria-describedby="virtModeCaption"
                  component="label"
                  disabled={isReadOnly}
                  htmlFor="virt_mode"
                >
                  VM Mode
                </FormLabel>
                <RadioGroup
                  aria-label="virt_mode"
                  className={classes.formGroup}
                  name="virt_mode"
                  onChange={formik.handleChange}
                  value={values.virt_mode}
                >
                  <FormControlLabel
                    control={<Radio />}
                    disabled={isReadOnly}
                    label="Paravirtualization"
                    value="paravirt"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    disabled={isReadOnly}
                    label="Full virtualization"
                    value="fullvirt"
                  />
                  <FormHelperText id="virtModeCaption">
                    Controls if devices inside your virtual machine are
                    paravirtualized or fully virtualized. Paravirt is what you
                    want, unless you&rsquo;re doing weird things.
                  </FormHelperText>
                </RadioGroup>
              </FormControl>
            </Grid>

            <Divider className={classes.divider} />

            <Grid xs={12}>
              <Typography variant="h3">Boot Settings</Typography>
              {kernels && (
                <KernelSelect
                  errorText={formik.errors.kernel}
                  kernels={kernels}
                  onChange={handleChangeKernel}
                  readOnly={isReadOnly}
                  selectedKernel={values.kernel}
                />
              )}

              <FormControl
                disabled={isReadOnly}
                fullWidth
                updateFor={[values.run_level, classes]}
              >
                <FormLabel component="label" htmlFor="run_level">
                  Run Level
                </FormLabel>
                <RadioGroup
                  aria-label="run_level"
                  className={classes.formGroup}
                  name="run_level"
                  onChange={formik.handleChange}
                  value={values.run_level}
                >
                  <FormControlLabel
                    control={<Radio />}
                    disabled={isReadOnly}
                    label="Run Default Level"
                    value="default"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    disabled={isReadOnly}
                    label="Single user mode"
                    value="single"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    disabled={isReadOnly}
                    label="init=/bin/bash"
                    value="binbash"
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
                  component="label"
                  disabled={isReadOnly}
                  htmlFor="memory_limit"
                >
                  Memory Limit
                </FormLabel>
                <RadioGroup
                  aria-label="memory_limit"
                  className={classes.formGroup}
                  name="setMemoryLimit"
                  onChange={formik.handleChange}
                  value={values.setMemoryLimit}
                >
                  <FormControlLabel
                    control={<Radio />}
                    disabled={isReadOnly}
                    label="Do not set any limits on memory usage"
                    value="no_limit"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    disabled={isReadOnly}
                    label="Limit the amount of RAM this config uses"
                    value="set_limit"
                  />
                </RadioGroup>
              </FormControl>

              {values.setMemoryLimit === 'set_limit' && (
                <TextField
                  disabled={isReadOnly}
                  errorText={formik.errors.memory_limit}
                  helperText={`Max: ${linode?.specs.memory} MB`}
                  label="Memory Limit Allotment (in MB)"
                  max={linode?.specs.memory}
                  min={0}
                  name="memory_limit"
                  onChange={formik.handleChange}
                  type="number"
                  value={values.memory_limit}
                />
              )}
            </Grid>

            <Divider className={classes.divider} />

            <Grid xs={12}>
              <Typography variant="h3">Block Device Assignment</Typography>
              <DeviceSelection
                counter={deviceCounter}
                devices={availableDevices}
                disabled={isReadOnly}
                errorText={formik.errors.devices as string}
                getSelected={(slot) => pathOr('', [slot], values.devices)}
                onChange={handleDevicesChanges}
                slots={deviceSlots}
              />
              <FormControl fullWidth>
                <Select
                  defaultValue={getSelectedOptionFromGroupedOptions(
                    initrdFromConfig,
                    categorizedInitrdOptions
                  )}
                  value={getSelectedOptionFromGroupedOptions(
                    values.initrd,
                    categorizedInitrdOptions
                  )}
                  isClearable={false}
                  label="initrd"
                  noMarginTop
                  onChange={handleInitrdChange}
                  options={categorizedInitrdOptions}
                  placeholder="None"
                />
              </FormControl>
              <Button
                buttonType="secondary"
                className={classes.button}
                compactX
                disabled={isReadOnly || deviceCounter >= deviceSlots.length - 1}
                onClick={() => setDeviceCounter((counter) => counter + 1)}
              >
                Add a Device
              </Button>

              <FormControl className={classes.formGroup} fullWidth>
                <FormControlLabel
                  control={
                    <Toggle
                      checked={useCustomRoot}
                      disabled={isReadOnly}
                      onChange={handleToggleCustomRoot}
                    />
                  }
                  label="Use Custom Root"
                  name="useCustomRoot"
                />
                {!useCustomRoot ? (
                  <Select
                    value={pathsOptions.find(
                      (device) => device.value === values.root_device
                    )}
                    disabled={isReadOnly}
                    errorText={formik.errors.root_device}
                    id="root_device"
                    isClearable={false}
                    label="Root Device"
                    name="root_device"
                    onChange={handleRootDeviceChange}
                    options={pathsOptions}
                    placeholder="None"
                  />
                ) : (
                  <TextField
                    disabled={isReadOnly}
                    errorGroup="linode-config-dialog"
                    errorText={formik.errors.root_device}
                    fullWidth
                    inputProps={{ id: 'root_device', name: 'root_device' }}
                    label="Custom"
                    name="root_device"
                    onChange={formik.handleChange}
                    value={values.root_device}
                  />
                )}
              </FormControl>
            </Grid>

            <Divider className={classes.divider} />

            {showVlans ? (
              <Grid xs={12}>
                <Box alignItems="center" display="flex">
                  <Typography variant="h3">Network Interfaces</Typography>
                  <TooltipIcon
                    sxTooltipIcon={{
                      paddingBottom: 0,
                      paddingTop: 0,
                    }}
                    text={
                      <Typography>
                        Configure the network that a selected interface will
                        connect to (either &quot;Public Internet&quot; or a
                        VLAN). Each Linode can have up to three Network
                        Interfaces. For more information, see our{' '}
                        <Link to="https://www.linode.com/docs/products/networking/vlans/guides/attach-to-compute-instance/#attaching-a-vlan-to-an-existing-compute-instance">
                          Network Interfaces guide
                        </Link>
                        .
                      </Typography>
                    }
                    classes={{ tooltip: classes.tooltip }}
                    interactive
                    status="help"
                  />
                </Box>
                {formik.errors.interfaces ? (
                  <Notice error text={formik.errors.interfaces as string} />
                ) : null}
                {values.interfaces.map((thisInterface, idx) => {
                  return (
                    <InterfaceSelect
                      handleChange={(newInterface: Interface) =>
                        handleInterfaceChange(idx, newInterface)
                      }
                      ipamError={
                        formik.errors[`interfaces[${idx}].ipam_address`]
                      }
                      ipamAddress={thisInterface.ipam_address}
                      key={`eth${idx}-interface`}
                      label={thisInterface.label}
                      labelError={formik.errors[`interfaces[${idx}].label`]}
                      purpose={thisInterface.purpose}
                      readOnly={isReadOnly}
                      region={linode?.region}
                      slotNumber={idx}
                    />
                  );
                })}
              </Grid>
            ) : null}

            <Grid xs={12}>
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
                <FormGroup className={classes.formGroup}>
                  <FormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.distro}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Helps maintain correct inittab/upstart console device"
                      />
                    }
                    className={classes.formControlToggle}
                    label="Enable distro helper"
                    name="helpers.distro"
                  />

                  <FormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.updatedb_disabled}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Disables updatedb cron job to avoid disk thrashing"
                      />
                    }
                    className={classes.formControlToggle}
                    label="Disable updatedb"
                    name="helpers.updatedb_disabled"
                  />

                  <FormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.modules_dep}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Creates a modules dependency file for the kernel you run"
                      />
                    }
                    className={classes.formControlToggle}
                    label="Enable modules.dep helper"
                    name="helpers.modules_dep"
                  />

                  <FormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.devtmpfs_automount}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Controls if pv_ops kernels automount devtmpfs at boot"
                      />
                    }
                    className={classes.formControlToggle}
                    label="Auto-mount devtmpfs"
                    name="helpers.devtmpfs_automount"
                  />

                  <FormControlLabel
                    control={
                      <Toggle
                        tooltipText={
                          <>
                            Automatically configure static networking
                            <Link to="https://www.linode.com/docs/platform/network-helper/">
                              (more info)
                            </Link>
                          </>
                        }
                        checked={values.helpers.network}
                        disabled={isReadOnly}
                        interactive={true}
                        onChange={formik.handleChange}
                      />
                    }
                    className={classes.formControlToggle}
                    label="Auto-configure networking"
                    name="helpers.network"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </React.Fragment>
        </DialogContent>
      </Grid>
      <StyledActionPanel>
        <Button buttonType="secondary" className="cancel" onClick={onClose}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          disabled={isReadOnly}
          loading={formik.isSubmitting}
          onClick={formik.submitForm}
        >
          {config ? 'Save Changes' : 'Add Configuration'}
        </Button>
      </StyledActionPanel>
    </Dialog>
  );
};

interface ConfigFormProps {
  children: JSX.Element;
  errors: APIError[] | null;
  loading: boolean;
}

const DialogContent: React.FC<ConfigFormProps> = (props) => {
  const { errors, loading } = props;

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
