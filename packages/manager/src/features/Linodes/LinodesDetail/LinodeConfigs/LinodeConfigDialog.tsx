import {
  Autocomplete,
  Box,
  Button,
  CircleProgress,
  Dialog,
  Divider,
  ErrorState,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Notice,
  Radio,
  TextField,
  Toggle,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { equals, repeat } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { DeviceSelection } from 'src/features/Linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import { titlecase } from 'src/features/Linodes/presentation';
import {
  LINODE_UNREACHABLE_HELPER_TEXT,
  NATTED_PUBLIC_IP_HELPER_TEXT,
  NOT_NATTED_HELPER_TEXT,
} from 'src/features/VPCs/constants';
import {
  useLinodeConfigCreateMutation,
  useLinodeConfigUpdateMutation,
} from 'src/queries/linodes/configs';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import {
  useAllLinodeKernelsQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { vlanQueries } from 'src/queries/vlans';
import { useAllVolumesQuery } from 'src/queries/volumes/volumes';
import { vpcQueries } from 'src/queries/vpcs/vpcs';
import { createDevicesFromStrings } from 'src/utilities/createDevicesFromStrings';
import { createStringsFromDevices } from 'src/utilities/createStringsFromDevices';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import { InterfaceSelect } from '../LinodeSettings/InterfaceSelect';
import { KernelSelect } from '../LinodeSettings/KernelSelect';
import { getSelectedDeviceOption } from '../utilities';
import {
  StyledDivider,
  StyledFormControl,
  StyledFormControlLabel,
  StyledFormGroup,
  StyledRadioGroup,
} from './LinodeConfigDialog.styles';
import { getPrimaryInterfaceIndex } from './utilities';

import type { ExtendedInterface } from '../LinodeSettings/InterfaceSelect';
import type {
  APIError,
  Config,
  Interface,
  LinodeConfigCreationData,
} from '@linode/api-v4';
import type { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface Helpers {
  devtmpfs_automount: boolean;
  distro: boolean;
  modules_dep: boolean;
  network: boolean;
  updatedb_disabled: boolean;
}

type RunLevel = 'binbash' | 'default' | 'single';
type VirtMode = 'fullvirt' | 'paravirt';
export type MemoryLimit = 'no_limit' | 'set_limit';

interface EditableFields {
  comments?: string;
  devices: DevicesAsStrings;
  helpers: Helpers;
  initrd: null | string;
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
  ip_ranges: [],
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

const defaultFieldsValues: EditableFields = {
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
    ({
      id,
      ip_ranges,
      ipam_address,
      ipv4,
      label,
      primary,
      purpose,
      subnet_id,
      vpc_id,
    }) => ({
      id,
      ip_ranges,
      ipam_address,
      ipv4,
      label,
      primary,
      purpose,
      subnet_id,
      vpc_id,
    })
  );
  return padInterfaceList(interfacesPayload);
};

const interfacesToPayload = (interfaces?: ExtendedInterface[]) => {
  if (!interfaces || interfaces.length === 0) {
    return [];
  }

  const filteredInterfaces = interfaces.filter(
    (thisInterface) => thisInterface.purpose !== 'none'
  );

  if (
    equals(
      filteredInterfaces,
      defaultInterfaceList.filter(
        (thisInterface) => thisInterface.purpose !== 'none'
      )
    )
  ) {
    // In this case, where eth0 is set to public interface
    // and no other interfaces are specified, the API prefers
    // to receive an empty array.
    return [];
  }

  return filteredInterfaces as Interface[];
};

const deviceSlots = ['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg', 'sdh'];
const deviceCounterDefault = 1;

// DiskID reserved on the back-end to indicate Finnix.
const finnixDiskID = 25669;

export const LinodeConfigDialog = (props: Props) => {
  const formContainerRef = React.useRef<HTMLDivElement>(null);
  const { config, isReadOnly, linodeId, onClose, open } = props;

  const { data: linode } = useLinodeQuery(linodeId, open);

  const { enqueueSnackbar } = useSnackbar();

  const virtModeCaptionId = React.useId();

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

  const theme = useTheme();

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
  const regionHasVPCs = regions.some(
    (thisRegion) =>
      thisRegion.id === linode?.region &&
      thisRegion.capabilities.includes('VPCs')
  );

  const { resetForm, setFieldValue, values, ...formik } = useFormik({
    initialValues: defaultFieldsValues,
    onSubmit: (values) => onSubmit(values),
    validate: (values) => {
      onValidate(values);
      scrollErrorIntoViewV2(formContainerRef);
    },
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
      configData.interfaces = configData.interfaces?.filter(
        (_interface) => _interface.purpose !== 'vlan'
      );
    }

    if (!regionHasVPCs) {
      configData.interfaces = configData.interfaces?.filter(
        (_interface) => _interface.purpose !== 'vpc'
      );
    }

    const actionType = Boolean(config) ? 'updated' : 'created';
    const handleSuccess = () => {
      formik.setSubmitting(false);
      // If there's any chance a VLAN changed here, make sure our query data is up to date
      if (
        configData.interfaces?.some(
          (thisInterface) => thisInterface.purpose === 'vlan'
        )
      ) {
        queryClient.invalidateQueries({
          queryKey: vlanQueries._def,
        });
      }

      // Ensure VPC query data is up-to-date
      const vpcId = configData.interfaces?.find(
        (thisInterface) => thisInterface.purpose === 'vpc'
      )?.vpc_id;

      if (vpcId) {
        queryClient.invalidateQueries({
          queryKey: vpcQueries.all._def,
        });
        queryClient.invalidateQueries({
          queryKey: vpcQueries.paginated._def,
        });
        queryClient.invalidateQueries({
          queryKey: vpcQueries.vpc(vpcId).queryKey,
        });
      }

      enqueueSnackbar(
        `Configuration ${configData.label} successfully ${actionType}`,
        {
          variant: 'success',
        }
      );
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
  }, [open, config, initrdFromConfig, resetForm, queryClient]);

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

  const categorizedInitrdOptions: {
    deviceType: string;
    label: string;
    value: null | string;
  }[] = Object.entries(initrdDisksObject).reduce((acc, [category, items]) => {
    const categoryTitle = titlecase(category);
    const options = [
      ...items.map(({ id, label }) => {
        return {
          deviceType: categoryTitle,
          label,
          value: String(id),
        };
      }),
      {
        deviceType: categoryTitle,
        label: 'Recovery – Finnix (initrd)',
        value: String(finnixDiskID),
      },
    ];
    return [...acc, ...options];
  }, []);

  categorizedInitrdOptions.unshift({
    deviceType: '',
    label: 'None',
    value: null,
  });

  const interfacesWithoutPlaceholderInterfaces = values.interfaces.filter(
    (i) => i.purpose !== 'none'
  ) as Interface[];

  const primaryInterfaceOptions = interfacesWithoutPlaceholderInterfaces.map(
    (networkInterface, idx) => ({
      label: `eth${idx}`,
      value: idx,
    })
  );

  const primaryInterfaceIndex = getPrimaryInterfaceIndex(
    interfacesWithoutPlaceholderInterfaces
  );

  /**
   * Form change handlers
   * (where formik.handleChange is insufficient)
   */

  const handleChangeKernel = React.useCallback(
    (selectedValue: string) => {
      setFieldValue('kernel', selectedValue);
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
    (slot: number, updatedInterface: ExtendedInterface) => {
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
    (selectedValue: string) => {
      setFieldValue('root_device', selectedValue);
    },
    [setFieldValue]
  );

  const handleInitrdChange = React.useCallback(
    (selectedDiskValue: string) => {
      setFieldValue('initrd', selectedDiskValue);
    },
    [setFieldValue]
  );

  const networkInterfacesHelperText = (
    <Typography>
      Configure the network that a selected interface will connect to
      &quot;Public Internet&quot;, VLAN, or VPC. Each Linode can have up to
      three Network Interfaces. For more information, see our{' '}
      <Link to="https://techdocs.akamai.com/cloud-computing/docs/attach-a-vlan-to-a-compute-instance#attaching-a-vlan-to-an-existing-compute-instance">
        Network Interfaces guide
      </Link>
      .
    </Typography>
  );

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={onClose}
      open={open}
      title={`${config ? 'Edit' : 'Add'} Configuration`}
    >
      <Grid container direction="row" ref={formContainerRef}>
        <DialogContent errors={kernelsError} loading={kernelsLoading}>
          <React.Fragment>
            {generalError && (
              <Grid>
                <Notice
                  errorGroup="linode-config-dialog"
                  spacingBottom={0}
                  text={generalError}
                  variant="error"
                />
              </Grid>
            )}
            <Grid size={12}>
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

            <StyledDivider />

            <Grid size={12}>
              <Typography variant="h3">Virtual Machine</Typography>
              <FormControl>
                <FormLabel
                  aria-describedby={virtModeCaptionId}
                  disabled={isReadOnly}
                  htmlFor="virt_mode"
                >
                  VM Mode
                </FormLabel>
                <StyledRadioGroup
                  aria-label="virt_mode"
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
                  <FormHelperText id={virtModeCaptionId}>
                    Controls if devices inside your virtual machine are
                    paravirtualized or fully virtualized. Paravirt is what you
                    want, unless you&rsquo;re doing weird things.
                  </FormHelperText>
                </StyledRadioGroup>
              </FormControl>
            </Grid>

            <StyledDivider />

            <Grid size={12}>
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

              <FormControl disabled={isReadOnly} fullWidth>
                <FormLabel htmlFor="run_level">Run Level</FormLabel>
                <StyledRadioGroup
                  aria-label="run_level"
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
                </StyledRadioGroup>
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
              <FormControl>
                <FormLabel disabled={isReadOnly} htmlFor="memory_limit">
                  Memory Limit
                </FormLabel>
                <StyledRadioGroup
                  aria-label="memory_limit"
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
                </StyledRadioGroup>
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

            <StyledDivider />

            <Grid size={12}>
              <Typography variant="h3">Block Device Assignment</Typography>
              <DeviceSelection
                getSelected={(slot) =>
                  values.devices?.[slot as keyof DevicesAsStrings] ?? ''
                }
                counter={deviceCounter}
                devices={availableDevices}
                disabled={isReadOnly}
                errorText={formik.errors.devices as string}
                onChange={handleDevicesChanges}
                slots={deviceSlots}
              />
              <FormControl fullWidth>
                <Autocomplete
                  defaultValue={getSelectedDeviceOption(
                    initrdFromConfig,
                    categorizedInitrdOptions
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.label === value.label
                  }
                  onChange={(_, selected) =>
                    handleInitrdChange(selected?.value)
                  }
                  value={getSelectedDeviceOption(
                    values.initrd,
                    categorizedInitrdOptions
                  )}
                  autoHighlight
                  clearIcon={null}
                  groupBy={(option) => option.deviceType}
                  label="initrd"
                  noMarginTop
                  options={categorizedInitrdOptions}
                  placeholder="None"
                />
              </FormControl>
              <Button
                sx={{
                  marginLeft: `1px`,
                  marginTop: theme.spacing(),
                }}
                buttonType="secondary"
                compactX
                disabled={isReadOnly || deviceCounter >= deviceSlots.length - 1}
                onClick={() => setDeviceCounter((counter) => counter + 1)}
              >
                Add a Device
              </Button>

              <StyledFormControl fullWidth>
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
                  <Autocomplete
                    onChange={(_, selected) =>
                      handleRootDeviceChange(selected?.value)
                    }
                    value={pathsOptions.find(
                      (device) => device.value === values.root_device
                    )}
                    autoHighlight
                    disableClearable
                    disabled={isReadOnly}
                    errorText={formik.errors.root_device}
                    id="root_device"
                    label="Root Device"
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
              </StyledFormControl>
            </Grid>

            <StyledDivider />

            <Grid size={12}>
              <Box alignItems="center" display="flex">
                <Typography variant="h3">Networking</Typography>
                <TooltipIcon
                  sxTooltipIcon={{
                    paddingBottom: 0,
                    paddingTop: 0,
                  }}
                  status="help"
                  sx={{ tooltip: { maxWidth: 350 } }}
                  text={networkInterfacesHelperText}
                />
              </Box>
              {formik.errors.interfaces && (
                <Notice
                  text={formik.errors.interfaces as string}
                  variant="error"
                />
              )}
              <>
                <Autocomplete
                  disableClearable={interfacesWithoutPlaceholderInterfaces.some(
                    (i) => i.purpose === 'public' || i.purpose === 'vpc'
                  )}
                  onChange={(_, selected) => {
                    const updatedInterfaces = [...values.interfaces];

                    for (let i = 0; i < updatedInterfaces.length; i++) {
                      if (selected && selected.value === i) {
                        updatedInterfaces[i].primary = true;
                      } else {
                        updatedInterfaces[i].primary = false;
                      }
                    }

                    formik.setValues({
                      ...values,
                      interfaces: updatedInterfaces,
                    });
                  }}
                  value={
                    primaryInterfaceIndex !== null
                      ? primaryInterfaceOptions[primaryInterfaceIndex]
                      : null
                  }
                  autoHighlight
                  data-testid="primary-interface-dropdown"
                  disabled={isReadOnly}
                  label="Primary Interface (Default Route)"
                  options={primaryInterfaceOptions}
                  placeholder="None"
                />
                <Divider
                  sx={{
                    margin: `${theme.spacing(
                      4.5
                    )} ${theme.spacing()} ${theme.spacing(1.5)} `,
                    width: `calc(100% - ${theme.spacing(2)})`,
                  }}
                />
              </>
              {values.interfaces.map((thisInterface, idx) => {
                const thisInterfaceIPRanges: ExtendedIP[] = (
                  thisInterface.ip_ranges ?? []
                ).map((ip_range, index) => {
                  // Display a more user-friendly error to the user as opposed to, for example, "interfaces[1].ip_ranges[1] is invalid"
                  // @ts-expect-error this form intentionally breaks formik's error type
                  const errorString: string = formik.errors[
                    `interfaces[${idx}].ip_ranges[${index}]`
                  ]?.includes('is invalid')
                    ? 'Invalid IP range'
                    : // @ts-expect-error this form intentionally breaks formik's error type
                      formik.errors[`interfaces[${idx}].ip_ranges[${index}]`];

                  return {
                    address: ip_range,
                    error: errorString,
                  };
                });

                return (
                  <React.Fragment key={`${idx}-interface`}>
                    {unrecommendedConfigNoticeSelector({
                      _interface: thisInterface,
                      primaryInterfaceIndex,
                      thisIndex: idx,
                      values,
                    })}
                    <InterfaceSelect
                      errors={{
                        ipRangeError:
                          // @ts-expect-error this form intentionally breaks formik's error type
                          formik.errors[`interfaces[${idx}].ip_ranges`],
                        ipamError:
                          // @ts-expect-error this form intentionally breaks formik's error type
                          formik.errors[`interfaces[${idx}].ipam_address`],
                        // @ts-expect-error this form intentionally breaks formik's error type
                        labelError: formik.errors[`interfaces[${idx}].label`],
                        primaryError:
                          // @ts-expect-error this form intentionally breaks formik's error type
                          formik.errors[`interfaces[${idx}].primary`],
                        publicIPv4Error:
                          // @ts-expect-error this form intentionally breaks formik's error type
                          formik.errors[`interfaces[${idx}].ipv4.nat_1_1`],
                        subnetError:
                          // @ts-expect-error this form intentionally breaks formik's error type
                          formik.errors[`interfaces[${idx}].subnet_id`],
                        // @ts-expect-error this form intentionally breaks formik's error type
                        vpcError: formik.errors[`interfaces[${idx}].vpc_id`],
                        vpcIPv4Error:
                          // @ts-expect-error this form intentionally breaks formik's error type
                          formik.errors[`interfaces[${idx}].ipv4.vpc`],
                      }}
                      handleChange={(newInterface: ExtendedInterface) => {
                        handleInterfaceChange(idx, newInterface);
                      }}
                      nattedIPv4Address={
                        thisInterface.ipv4?.nat_1_1 ?? undefined
                      }
                      additionalIPv4RangesForVPC={thisInterfaceIPRanges}
                      ipamAddress={thisInterface.ipam_address}
                      key={`eth${idx}-interface`}
                      label={thisInterface.label}
                      purpose={thisInterface.purpose}
                      readOnly={isReadOnly}
                      region={linode?.region}
                      regionHasVLANs={regionHasVLANS}
                      regionHasVPCs={regionHasVPCs}
                      slotNumber={idx}
                      subnetId={thisInterface.subnet_id}
                      vpcIPv4={thisInterface.ipv4?.vpc ?? undefined}
                      vpcId={thisInterface.vpc_id}
                    />
                  </React.Fragment>
                );
              })}
            </Grid>

            <Grid size={12}>
              <Typography variant="h3">Filesystem/Boot Helpers</Typography>
              <FormControl fullWidth>
                <StyledFormGroup>
                  <StyledFormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.distro}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Helps maintain correct inittab/upstart console device"
                      />
                    }
                    label="Enable distro helper"
                    name="helpers.distro"
                  />

                  <StyledFormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.updatedb_disabled}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Disables updatedb cron job to avoid disk thrashing"
                      />
                    }
                    label="Disable updatedb"
                    name="helpers.updatedb_disabled"
                  />

                  <StyledFormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.modules_dep}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Creates a modules dependency file for the kernel you run"
                      />
                    }
                    label="Enable modules.dep helper"
                    name="helpers.modules_dep"
                  />

                  <StyledFormControlLabel
                    control={
                      <Toggle
                        checked={values.helpers.devtmpfs_automount}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                        tooltipText="Controls if pv_ops kernels automount devtmpfs at boot"
                      />
                    }
                    label="Auto-mount devtmpfs"
                    name="helpers.devtmpfs_automount"
                  />

                  <StyledFormControlLabel
                    control={
                      <Toggle
                        tooltipText={
                          <>
                            Automatically configure static networking
                            <Link to="https://techdocs.akamai.com/cloud-computing/docs/automatically-configure-networking">
                              (more info)
                            </Link>
                          </>
                        }
                        checked={values.helpers.network}
                        disabled={isReadOnly}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Auto-configure networking"
                    name="helpers.network"
                  />
                </StyledFormGroup>
              </FormControl>
            </Grid>
          </React.Fragment>
        </DialogContent>
      </Grid>
      <ActionsPanel
        primaryButtonProps={{
          disabled: isReadOnly,
          label: config ? 'Save Changes' : 'Add Configuration',
          loading: formik.isSubmitting,
          onClick: formik.submitForm,
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        sx={{ display: 'flex', justifySelf: 'flex-end' }}
      />
    </Dialog>
  );
};

interface ConfigFormProps {
  children: JSX.Element;
  errors: APIError[] | null;
  loading: boolean;
}

const DialogContent = (props: ConfigFormProps) => {
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

const noticeForScenario = (scenarioText: string) => (
  <Notice
    data-testid={'notice-for-unrecommended-scenario'}
    text={scenarioText}
    variant="warning"
  />
);

/**
 *
 * @param _interface the current config interface being passed in
 * @param primaryInterfaceIndex the index of the primary interface
 * @param thisIndex the index of the current config interface within the `interfaces` array of the `config` object
 * @param values the values held in Formik state, having a type of `EditableFields`
 * @returns JSX.Element | null
 */
export const unrecommendedConfigNoticeSelector = ({
  _interface,
  primaryInterfaceIndex,
  thisIndex,
  values,
}: {
  _interface: ExtendedInterface;
  primaryInterfaceIndex: null | number;
  thisIndex: number;
  values: EditableFields;
}): JSX.Element | null => {
  const vpcInterface = _interface.purpose === 'vpc';
  const nattedIPv4Address = Boolean(_interface.ipv4?.nat_1_1);

  const filteredInterfaces = values.interfaces.filter(
    (_interface) => _interface.purpose !== 'none'
  );

  // Edge case: users w/ ability to have multiple VPC interfaces. Scenario 1 & 2 notices not helpful if that's done
  const primaryInterfaceIsVPC =
    primaryInterfaceIndex !== null &&
    values.interfaces[primaryInterfaceIndex].purpose === 'vpc';

  /*
   Scenario 1:
    - the interface passed in to this function is a VPC interface
    - the index of the primary interface !== the index of the interface passed in to this function
    - nattedIPv4Address (i.e., "Assign a public IPv4 address for this Linode" checked)

   Scenario 2:
    - all of Scenario 1, except: !nattedIPv4Address (i.e., "Assign a public IPv4 address for this Linode" unchecked)

   Scenario 3:
    - only eth0 populated, and it is a VPC interface

   If not one of the above scenarios, do not display a warning notice re: configuration
  */
  if (
    vpcInterface &&
    primaryInterfaceIndex !== thisIndex &&
    !primaryInterfaceIsVPC
  ) {
    return nattedIPv4Address
      ? noticeForScenario(NATTED_PUBLIC_IP_HELPER_TEXT)
      : noticeForScenario(LINODE_UNREACHABLE_HELPER_TEXT);
  }

  if (filteredInterfaces.length === 1 && vpcInterface && !nattedIPv4Address) {
    return noticeForScenario(NOT_NATTED_HELPER_TEXT);
  }

  return null;
};
