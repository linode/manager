import { appendConfigInterface } from '@linode/api-v4';
import { createLinodeInterface } from '@linode/api-v4';
import {
  getAllLinodeConfigs,
  useAllLinodesQuery,
  useFirewallSettingsQuery,
} from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  Notice,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { useFormattedDate } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as React from 'react';

import { Code } from 'src/components/Code/Code';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { Link } from 'src/components/Link';
import { RemovableSelectionsListTable } from 'src/components/RemovableSelectionsList/RemovableSelectionsListTable';
import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import {
  usePermissions,
  useQueryWithPermissions,
} from 'src/features/IAM/hooks/usePermissions';
import { getDefaultFirewallForInterfacePurpose } from 'src/features/Linodes/LinodeCreate/Networking/utilities';
import {
  REMOVABLE_SELECTIONS_LINODES_TABLE_HEADERS,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
  VPC_MULTIPLE_CONFIGURATIONS_LEARN_MORE_LINK,
} from 'src/features/VPCs/constants';
import { useUnassignLinode } from 'src/hooks/useUnassignLinode';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';
import { getErrorMap } from 'src/utilities/errorUtils';
import { SUBNET_LINODE_CSV_HEADERS } from 'src/utilities/subnets';

import { PublicAccess } from '../components/PublicAccess';
import {
  MULTIPLE_CONFIGURATIONS_MESSAGE,
  REGIONAL_LINODE_MESSAGE,
} from '../constants';
import {
  generateVPCIPv6InputHelperText,
  getLinodeInterfaceIPv4Ranges,
  getLinodeInterfacePrimaryIPv4,
  getVPCInterfacePayload,
  transformLinodeInterfaceErrorsToFormikErrors,
} from '../utils';
import { AssignIPRanges } from './AssignIPRanges';
import { StyledButtonBox } from './SubnetAssignLinodesDrawer.styles';
import { SubnetLinodeActionNotice } from './SubnetLinodeActionNotice';

import type {
  APIError,
  Config,
  Interface,
  InterfacePayload,
  Linode,
  LinodeInterface,
  Subnet,
} from '@linode/api-v4';
import type { ExtendedIP } from 'src/utilities/ipUtils';

// @TODO VPC: if all subnet action menu item related components use (most of) this as their props, might be worth
// putting this in a common file and naming it something like SubnetActionMenuItemProps or something
interface SubnetAssignLinodesDrawerProps {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  subnetError?: APIError[] | null;
  vpcId: number;
  vpcRegion: string;
}

interface LinodeAndInterfaceData extends Linode {
  configId: null | number;
  interfaceId: number | undefined;
  linodeConfigLabel: string;
  // Normalize VPC IPv4 and ranges for display/download since legacy and Linode interfaces have different shapes
  // Legacy: VPC IPv4 = interface.ipv4.vpc, VPC ranges = interface.ip_ranges
  // Linode Interface: VPC IPv4 = interface.vpc.ipv4.addresses[], VPC ranges = interface.vpc.ipv4.ranges
  vpcIPv4: null | string | undefined;
  vpcIPv4Ranges: string[] | undefined;
  vpcIPv6: null | string | undefined;
  vpcIPv6Ranges: string[] | undefined;
}

export const SubnetAssignLinodesDrawer = (
  props: SubnetAssignLinodesDrawerProps
) => {
  const { isFetching, onClose, open, subnet, subnetError, vpcId, vpcRegion } =
    props;
  const {
    invalidateQueries,
    setUnassignLinodesErrors,
    unassignLinode,
    unassignLinodesErrors,
  } = useUnassignLinode();
  const csvRef = React.useRef<any>(undefined);
  const newInterface = React.useRef<Interface | LinodeInterface>(undefined);
  const removedLinodeId = React.useRef<number>(-1);
  const formattedDate = useFormattedDate();
  const theme = useTheme();

  const { isDualStackEnabled } = useVPCDualStack(subnet?.ipv6 ?? []);
  // Only show the "VPC IPv6" field, "Add IPv6 Range" button, and Dual Stack tooltip copy if this is a Dual Stack VPC
  const showIPv6Content =
    isDualStackEnabled &&
    Boolean(subnet?.ipv6?.length && subnet?.ipv6?.length > 0);

  const { data: firewallSettings } = useFirewallSettingsQuery();
  const defaultFirewall = getDefaultFirewallForInterfacePurpose(
    'vpc',
    firewallSettings
  );

  const [assignLinodesErrors, setAssignLinodesErrors] = React.useState<
    Record<string, string | undefined>
  >({});

  // While the drawer is open, we maintain a local list of assigned Linodes.
  // This is distinct from the subnet's global list of assigned Linodes, which encompasses all assignments.
  // The local list resets to empty when the drawer is closed and reopened.
  const [assignedLinodesAndInterfaceData, setAssignedLinodesAndInterfaceData] =
    React.useState<LinodeAndInterfaceData[]>([]);
  const [linodeConfigs, setLinodeConfigs] = React.useState<Config[]>([]);

  const [autoAssignVPCIPv4Address, setAutoAssignVPCIPv4Address] =
    React.useState<boolean>(true);

  const [autoAssignVPCIPv6Address, setAutoAssignVPCIPv6Address] =
    React.useState<boolean>(true);

  const [allowPublicIPv4Access, setAllowPublicIPv4Access] =
    React.useState<boolean>(false);

  const [allowPublicIPv6Access, setAllowPublicIPv6Access] =
    React.useState<boolean>(false);

  const { data: permissions } = usePermissions('vpc', ['update_vpc'], vpcId);
  const { data: filteredLinodes } = useQueryWithPermissions<Linode>(
    useAllLinodesQuery(),
    'linode',
    [
      'create_linode_config_profile_interface',
      'delete_linode_config_profile_interface',
    ]
  );

  const userCannotAssignLinodes =
    !permissions?.update_vpc && filteredLinodes?.length === 0;

  const downloadCSV = async () => {
    await getCSVData();
    csvRef.current.link.click();
  };

  // We only want the linodes from the same region as the VPC
  const { data: linodes, refetch: getCSVData } = useAllLinodesQuery(
    {},
    {
      region: vpcRegion,
    }
  );

  // We need to filter to the linodes from this region that are not already
  // assigned to this subnet
  const findUnassignedLinodes = React.useCallback(() => {
    return linodes?.filter((linode) => {
      return !subnet?.linodes.some((linodeInfo) => linodeInfo.id === linode.id);
    });
  }, [subnet, linodes]);

  const [linodeOptionsToAssign, setLinodeOptionsToAssign] = React.useState<
    Linode[]
  >([]);

  // Moved the list of linodes that are currently assignable to a subnet into a state variable (linodeOptionsToAssign)
  // and update that list whenever this subnet or the list of all linodes in this subnet's region changes. This takes
  // care of the MUI invalid value warning that was occurring before in the Linodes autocomplete [M3-6752]
  React.useEffect(() => {
    if (linodes) {
      setLinodeOptionsToAssign(findUnassignedLinodes() ?? []);
    }
  }, [linodes, setLinodeOptionsToAssign, findUnassignedLinodes]);

  // Determine the configId based on the number of configurations
  function getConfigId(inputs: {
    isLinodeInterface: boolean;
    linodeConfigs: Config[];
    selectedConfig: Config | null;
  }) {
    const { linodeConfigs, selectedConfig, isLinodeInterface } = inputs;
    if (isLinodeInterface) {
      return null;
    }

    return (
      // Use the first configuration's id or -1 if no configurations
      // Use selected configuration's id if available
      (linodeConfigs.length > 1 ? selectedConfig?.id : linodeConfigs[0]?.id) ??
      -1
    );
  }

  const handleAssignLinode = async () => {
    const {
      chosenIPv4,
      chosenIPv6,
      ipv4Ranges,
      ipv6Ranges,
      selectedConfig,
      selectedLinode,
      selectedFirewall,
    } = values;

    const configId = getConfigId({
      isLinodeInterface,
      linodeConfigs,
      selectedConfig,
    });
    const configToBeModified = linodeConfigs.find(
      (config) => config.id === configId
    );

    const interfacePayload = getVPCInterfacePayload({
      firewallId: selectedFirewall,
      autoAssignVPCIPv4Address,
      autoAssignVPCIPv6Address,
      chosenIPv4,
      chosenIPv6,
      ipv4Ranges,
      ipv6Ranges,
      allowPublicIPv4Access,
      allowPublicIPv6Access,
      subnetId: subnet?.id,
      vpcId,
      isLinodeInterface,
      vpcIPv6FeatureEnabled: showIPv6Content,
    });

    try {
      setAssignLinodesErrors({});

      let _newInterface;

      if ('purpose' in interfacePayload) {
        // If the config has only an implicit public interface, make it explicit and
        // add it in eth0
        if (configToBeModified?.interfaces?.length === 0) {
          appendConfigInterface(
            selectedLinode?.id ?? -1,
            configId ?? -1,
            defaultPublicInterface
          );
        }

        _newInterface = await appendConfigInterface(
          selectedLinode?.id ?? -1,
          configId ?? -1,
          interfacePayload
        );
      } else {
        _newInterface = await createLinodeInterface(
          selectedLinode?.id ?? -1,
          interfacePayload
        );
      }

      // We're storing this in a ref to access this later in order
      // to update `assignedLinodesAndConfigData` with the new
      // interface data without causing a re-render
      newInterface.current = _newInterface;

      await invalidateQueries({
        configId,
        linodeId: selectedLinode?.id ?? -1,
        vpcId,
      });
    } catch (errors) {
      const updatedErrors =
        transformLinodeInterfaceErrorsToFormikErrors(errors);
      const fieldsOfIPRangesErrors = updatedErrors.reduce(
        (accum: any, _err: { field?: string }) => {
          if (_err.field && _err.field.includes('ip_ranges[')) {
            return [...accum, _err.field];
          } else {
            return [...accum];
          }
        },
        []
      );

      const fieldsOfIPv6RangesErrors = updatedErrors.reduce(
        (accum: any, _err: { field?: string }) => {
          if (_err.field && _err.field.includes('vpc.ipv6.ranges[')) {
            return [...accum, _err.field];
          } else {
            return [...accum];
          }
        },
        []
      );

      const errorMap = getErrorMap(
        [
          ...fieldsOfIPRangesErrors,
          ...fieldsOfIPv6RangesErrors,
          'ipv4.vpc',
          'ip_ranges',
          'firewall_id',
          'vpc.ipv6.slaac[0].range',
        ],
        errors
      );

      const ipv4RangesWithErrors = ipv4Ranges.map((ipRange, idx) => {
        const errorForThisIdx = errorMap[`ip_ranges[${idx}]`];
        return {
          address: ipRange.address,
          error: errorForThisIdx,
        };
      });

      const ipv6RangesWithErrors = ipv6Ranges.map((ipRange, idx) => {
        const errorForThisIdx = errorMap[`vpc.ipv6.ranges[${idx}].range`];
        return {
          address: ipRange.address,
          error: errorForThisIdx,
        };
      });

      setFieldValue('ipv4Ranges', ipv4RangesWithErrors);
      setFieldValue('ipv6Ranges', ipv6RangesWithErrors);

      const errorMessage = determineErrorMessage(configId, errorMap);

      setAssignLinodesErrors({ ...errorMap, none: errorMessage });
    }
  };

  const handleUnassignLinode = async (data: LinodeAndInterfaceData) => {
    const { configId, id: linodeId, interfaceId } = data;
    removedLinodeId.current = linodeId;
    try {
      await unassignLinode({
        configId,
        interfaceId: interfaceId ?? -1,
        linodeId,
        vpcId,
      });
    } catch (errors) {
      setUnassignLinodesErrors(errors as APIError[]);
    }
  };

  const handleAutoAssignIPv4Change = () => {
    setAutoAssignVPCIPv4Address(!autoAssignVPCIPv4Address);
  };

  const handleAutoAssignIPv6Change = () => {
    setAutoAssignVPCIPv6Address(!autoAssignVPCIPv6Address);
  };

  const handleAllowPublicIPv4AccessChange = () => {
    setAllowPublicIPv4Access(!allowPublicIPv4Access);
  };

  const handleAllowPublicIPv6AccessChange = () => {
    setAllowPublicIPv6Access(!allowPublicIPv6Access);
  };

  // Helper function to determine the error message based on the configId
  // A null configId means the selected Linode is using Linode Interfaces
  const determineErrorMessage = (
    configId: null | number,
    errorMap: Record<string, string | undefined>
  ) => {
    if (configId === -1) {
      return 'Selected Linode must have at least one configuration profile';
    }
    return errorMap.none;
  };

  const {
    dirty,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    setValues,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      chosenIPv4: '',
      chosenIPv6: '',
      ipv4Ranges: [] as ExtendedIP[],
      ipv6Ranges: [] as ExtendedIP[],
      selectedConfig: null as Config | null,
      selectedLinode: null as Linode | null,
      selectedFirewall: defaultFirewall as null | number,
    },
    onSubmit: handleAssignLinode,
    validateOnBlur: false,
    validateOnChange: false,
  });
  const isLinodeInterface =
    values.selectedLinode?.interface_generation === 'linode';

  const handleIPv4RangeChange = React.useCallback(
    (_ipRanges: ExtendedIP[]) => {
      setFieldValue('ipv4Ranges', _ipRanges);
    },
    [setFieldValue]
  );

  const handleIPv6RangeChange = React.useCallback(
    (_ipv6Ranges: ExtendedIP[]) => {
      setFieldValue('ipv6Ranges', _ipv6Ranges);
    },
    [setFieldValue]
  );

  React.useEffect(() => {
    // Return early if no Linode is selected
    if (!values.selectedLinode) {
      return;
    }
    // Check if the selected Linode is already assigned to the subnet
    if (
      values.selectedLinode &&
      subnet?.linodes.some(
        (linodeInfo) => linodeInfo.id === values.selectedLinode?.id
      )
    ) {
      const configId = getConfigId({
        isLinodeInterface,
        linodeConfigs,
        selectedConfig: values.selectedConfig,
      });

      // Construct a new Linode data object with additional properties
      const newLinodeData = {
        ...values.selectedLinode,
        configId,
        interfaceId: newInterface?.current?.id,
        // Create a label that combines Linode label and configuration label (if available)
        linodeConfigLabel: `${values.selectedLinode.label}${
          values.selectedConfig?.label && !isLinodeInterface
            ? ` (${values.selectedConfig.label})`
            : ''
        }`,
        vpcIPv4: newInterface?.current
          ? 'vpc' in newInterface.current
            ? getLinodeInterfacePrimaryIPv4(newInterface.current)
            : newInterface?.current?.ipv4?.vpc
          : '',
        vpcIPv6: newInterface?.current
          ? 'vpc' in newInterface.current
            ? newInterface.current.vpc?.ipv6?.slaac[0].address
            : (newInterface?.current?.ipv6?.slaac[0].address ?? null)
          : null,
        vpcIPv4Ranges: newInterface?.current
          ? 'vpc' in newInterface.current
            ? getLinodeInterfaceIPv4Ranges(newInterface.current)
            : newInterface.current?.ip_ranges
          : [],
        vpcIPv6Ranges: newInterface?.current
          ? 'vpc' in newInterface.current
            ? newInterface.current.vpc?.ipv6?.ranges.map(
                (rangeObj) => rangeObj.range
              )
            : newInterface.current?.ipv6?.ranges.map(
                (rangeObj) => rangeObj.range
              )
          : [],
      };

      // Add the new Linode data to the list of assigned Linodes and configurations
      setAssignedLinodesAndInterfaceData([
        ...assignedLinodesAndInterfaceData,
        newLinodeData,
      ]);

      // Reset the form, clear its values, and remove any previously selected Linode configurations when a Linode is chosen
      resetForm();
      setLinodeConfigs([]);
      setValues({
        chosenIPv4: '',
        chosenIPv6: '',
        ipv4Ranges: [],
        ipv6Ranges: [],
        selectedConfig: null,
        selectedLinode: null,
        selectedFirewall: defaultFirewall,
      });
    }
  }, [
    subnet,
    isLinodeInterface,
    assignedLinodesAndInterfaceData,
    values.ipv4Ranges,
    values.ipv6Ranges,
    values.selectedLinode,
    values.selectedConfig,
    linodeConfigs,
    defaultFirewall,
    resetForm,
    setLinodeConfigs,
    setValues,
  ]);

  React.useEffect(() => {
    // if a linode is not assigned to the subnet but is in assignedLinodesAndConfigData,
    // we want to remove it from assignedLinodesAndConfigData
    const isLinodeToRemoveValid =
      removedLinodeId.current !== -1 &&
      !subnet?.linodes.some(
        (linodeInfo) => linodeInfo.id === removedLinodeId.current
      ) &&
      !!assignedLinodesAndInterfaceData.find(
        (data) => data.id === removedLinodeId.current
      );

    if (isLinodeToRemoveValid) {
      setAssignedLinodesAndInterfaceData(
        [...assignedLinodesAndInterfaceData].filter(
          (linode) => linode.id !== removedLinodeId.current
        )
      );
    }
  }, [subnet, assignedLinodesAndInterfaceData]);

  const getLinodeConfigData = React.useCallback(
    async (linode: Linode | null) => {
      if (linode && linode.interface_generation !== 'linode') {
        try {
          const data = await getAllLinodeConfigs(linode.id);
          setLinodeConfigs(data);
        } catch (errors) {
          // force error to appear at top of drawer
          setAssignLinodesErrors({
            none: 'Could not load configurations for selected linode',
          });
        }
      } else {
        setLinodeConfigs([]);
      }
    },
    []
  );

  // Every time we select a new linode, we need to get its config data (callback above)
  React.useEffect(() => {
    getLinodeConfigData(values.selectedLinode);
  }, [values.selectedLinode, getLinodeConfigData]);

  const handleOnClose = () => {
    onClose();
    resetForm();
    setAssignedLinodesAndInterfaceData([]);
    setLinodeConfigs([]);
    setAssignLinodesErrors({});
    setUnassignLinodesErrors([]);
    setAutoAssignVPCIPv4Address(true);
    setAutoAssignVPCIPv6Address(true);
    setAllowPublicIPv4Access(false);
    setAllowPublicIPv6Access(false);
  };

  return (
    <Drawer
      error={subnetError}
      isFetching={isFetching}
      onClose={handleOnClose}
      open={open}
      title={`Assign Linodes to subnet: ${subnet?.label ?? 'Unknown'} (${
        subnet?.ipv4 ?? subnet?.ipv6 ?? 'Unknown'
      })`}
    >
      {userCannotAssignLinodes && (
        <Notice
          text={`You don't have permissions to assign Linodes to ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      {assignLinodesErrors.none && (
        <Notice text={assignLinodesErrors.none} variant="error" />
      )}
      <SubnetLinodeActionNotice linodeAction="Assigning" />
      <form onSubmit={handleSubmit}>
        <Typography>{REGIONAL_LINODE_MESSAGE}</Typography>
        <LinodeSelect
          checkIsOptionEqualToValue
          disabled={userCannotAssignLinodes}
          label="Linode"
          onSelectionChange={(selected) => {
            setFieldValue('selectedLinode', selected);
            setAssignLinodesErrors({});
          }}
          // We only want to be able to assign linodes that were not already assigned to this subnet
          options={linodeOptionsToAssign}
          placeholder="Select Linode or type to search"
          sx={(theme) => ({ marginBottom: theme.spacingFunction(8) })}
          value={values.selectedLinode?.id || null}
        />
        {values.selectedLinode?.id && (
          <>
            {autoAssignVPCIPv4Address && assignLinodesErrors['ipv4.vpc'] && (
              <Notice spacingBottom={0} spacingTop={16} variant="error">
                <Typography>{assignLinodesErrors['ipv4.vpc']}</Typography>
              </Notice>
            )}
            <Box
              alignItems="center"
              display="flex"
              flexDirection="row"
              sx={(theme) => ({ marginLeft: theme.spacingFunction(4) })}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoAssignVPCIPv4Address}
                    onChange={handleAutoAssignIPv4Change}
                  />
                }
                data-testid="vpc-ipv4-checkbox"
                disabled={userCannotAssignLinodes}
                label={<Typography>Auto-assign VPC IPv4 address</Typography>}
                sx={{ marginRight: 0 }}
              />
              <TooltipIcon
                status="info"
                text={
                  showIPv6Content ? (
                    <Typography component="span">
                      Automatically assign an IPv4 address as{' '}
                      {showIPv6Content ? 'a' : 'the'} private IP address for
                      this Linode in the VPC.
                    </Typography>
                  ) : (
                    VPC_AUTO_ASSIGN_IPV4_TOOLTIP
                  )
                }
              />
            </Box>
            {!autoAssignVPCIPv4Address && (
              <TextField
                disabled={userCannotAssignLinodes}
                errorText={assignLinodesErrors['ipv4.vpc']}
                label="VPC IPv4"
                noMarginTop={showIPv6Content}
                onChange={(e) => {
                  setFieldValue('chosenIPv4', e.target.value);
                  setAssignLinodesErrors({});
                }}
                style={{
                  marginBottom: showIPv6Content ? theme.spacingFunction(24) : 0,
                }}
                value={values.chosenIPv4}
              />
            )}
            {showIPv6Content && (
              <>
                {autoAssignVPCIPv6Address &&
                  assignLinodesErrors['vpc.ipv6.slaac[0].range'] && (
                    <Notice spacingBottom={0} spacingTop={16} variant="error">
                      <Typography>
                        {assignLinodesErrors['vpc.ipv6.slaac[0].range']}
                      </Typography>
                    </Notice>
                  )}
                <Box
                  alignItems="center"
                  display="flex"
                  flexDirection="row"
                  sx={(theme) => ({ marginLeft: theme.spacingFunction(4) })}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoAssignVPCIPv6Address}
                        onChange={handleAutoAssignIPv6Change}
                      />
                    }
                    data-testid="vpc-ipv6-checkbox"
                    disabled={userCannotAssignLinodes}
                    label={
                      <Typography>Auto-assign VPC IPv6 address</Typography>
                    }
                    sx={{ marginRight: 0 }}
                  />
                  <TooltipIcon
                    status="info"
                    text={
                      <Typography component="span">
                        Automatically assign an IPv6 address as a private IP
                        address for this Linode in the VPC. A <Code>/52</Code>{' '}
                        IPv6 network prefix is allocated for the VPC.
                      </Typography>
                    }
                  />
                </Box>
                {!autoAssignVPCIPv6Address && (
                  <TextField
                    disabled={userCannotAssignLinodes}
                    errorText={assignLinodesErrors['vpc.ipv6.slaac[0].range']}
                    helperText={generateVPCIPv6InputHelperText(
                      subnet?.ipv6?.[0].range ?? ''
                    )}
                    label="VPC IPv6"
                    noMarginTop
                    onChange={(e) => {
                      setFieldValue('chosenIPv6', e.target.value);
                      setAssignLinodesErrors({});
                    }}
                    value={values.chosenIPv6}
                  />
                )}
              </>
            )}
            {linodeConfigs.length > 1 && !isLinodeInterface && (
              <>
                <Typography sx={{ marginTop: `16px` }}>
                  {MULTIPLE_CONFIGURATIONS_MESSAGE}{' '}
                  <Link to={VPC_MULTIPLE_CONFIGURATIONS_LEARN_MORE_LINK}>
                    Learn more
                  </Link>
                  .
                </Typography>
                <Autocomplete
                  disabled={userCannotAssignLinodes}
                  label={'Configuration profile'}
                  onChange={(_, value: Config) => {
                    setFieldValue('selectedConfig', value);
                    setAssignLinodesErrors({});
                  }}
                  options={linodeConfigs}
                  placeholder="Select a configuration profile"
                  value={values.selectedConfig || null}
                />
              </>
            )}
            <PublicAccess
              allowPublicIPv4Access={allowPublicIPv4Access}
              allowPublicIPv6Access={allowPublicIPv6Access}
              handleAllowPublicIPv4AccessChange={
                handleAllowPublicIPv4AccessChange
              }
              handleAllowPublicIPv6AccessChange={
                handleAllowPublicIPv6AccessChange
              }
              showIPv6Content={showIPv6Content}
              sx={{ margin: `${theme.spacingFunction(16)} 0` }}
              userCannotAssignLinodes={userCannotAssignLinodes}
            />
            {/* Display the 'Assign additional [IPv4] ranges' section if
                the Configuration Profile section has been populated, or
                if it doesn't display b/c the linode has a single config
            */}
            {((linodeConfigs.length > 1 && values.selectedConfig) ||
              linodeConfigs.length === 1 ||
              isLinodeInterface) && (
              <AssignIPRanges
                handleIPRangeChange={handleIPv4RangeChange}
                handleIPv6RangeChange={handleIPv6RangeChange}
                includeDescriptionInTooltip={showIPv6Content}
                ipRangesError={assignLinodesErrors['ip_ranges']}
                ipv4Ranges={values.ipv4Ranges}
                ipv6Ranges={values.ipv6Ranges}
                ipv6RangesError={assignLinodesErrors['vpc.ipv6.ranges']}
                showIPv6Fields={showIPv6Content}
                sx={{ margin: `${theme.spacingFunction(16)} 0` }}
              />
            )}
            {isLinodeInterface && (
              <>
                <Divider spacingBottom={20} spacingTop={20} />
                <FirewallSelect
                  disableClearable
                  errorText={assignLinodesErrors['firewall_id']}
                  label="VPC Interface Firewall"
                  onChange={(e, firewall) =>
                    setFieldValue('selectedFirewall', firewall?.id)
                  }
                  value={values.selectedFirewall}
                />
              </>
            )}
          </>
        )}
        <StyledButtonBox>
          <Button
            buttonType="primary"
            disabled={
              userCannotAssignLinodes ||
              !dirty ||
              !values.selectedLinode ||
              (!isLinodeInterface &&
                linodeConfigs.length > 1 &&
                !values.selectedConfig)
            }
            loading={isSubmitting}
            type="submit"
          >
            Assign Linode
          </Button>
        </StyledButtonBox>
      </form>
      {unassignLinodesErrors
        ? unassignLinodesErrors.map((apiError: APIError) => (
            <Notice
              key={apiError.reason}
              spacingBottom={8}
              text={apiError.reason}
              variant="error"
            />
          ))
        : null}
      <RemovableSelectionsListTable
        displayVPCIPv6Data={showIPv6Content}
        headerText={`Linodes recently assigned to Subnet (${assignedLinodesAndInterfaceData.length})`}
        noDataText={'No Linodes have been assigned.'}
        onRemove={(data) => {
          handleUnassignLinode(data as LinodeAndInterfaceData);
          setUnassignLinodesErrors([]);
        }}
        preferredDataLabel="linodeConfigLabel"
        selectionData={assignedLinodesAndInterfaceData}
        tableHeaders={
          showIPv6Content
            ? [
                ...REMOVABLE_SELECTIONS_LINODES_TABLE_HEADERS,
                'VPC IPv6',
                'VPC IPv6 Ranges',
              ]
            : REMOVABLE_SELECTIONS_LINODES_TABLE_HEADERS
        }
      />
      {assignedLinodesAndInterfaceData.length > 0 && (
        <DownloadCSV
          buttonType="styledLink"
          csvRef={csvRef}
          data={assignedLinodesAndInterfaceData}
          filename={`linodes-assigned-${formattedDate}.csv`}
          headers={
            showIPv6Content
              ? [
                  ...SUBNET_LINODE_CSV_HEADERS,
                  { key: 'vpcIPv6', label: 'IPv6 VPC' },
                  { key: 'vpcIPv6Ranges', label: 'IPv6 VPC Ranges' },
                ]
              : SUBNET_LINODE_CSV_HEADERS
          }
          onClick={downloadCSV}
          sx={{
            alignItems: 'flex-start',
            display: 'flex',
            gap: 1,
            marginTop: 2,
            textAlign: 'left',
          }}
          text={'Download List of Assigned Linodes (.csv)'}
        />
      )}
      <StyledButtonBox>
        <Button buttonType="outlined" onClick={handleOnClose}>
          Done
        </Button>
      </StyledButtonBox>
    </Drawer>
  );
};

const defaultPublicInterface: InterfacePayload = {
  ipam_address: '',
  label: '',
  purpose: 'public',
};
