import { appendConfigInterface } from '@linode/api-v4';
import { createLinodeInterface } from '@linode/api-v4';
import {
  getAllLinodeConfigs,
  useAllLinodesQuery,
  useFirewallSettingsQuery,
  useGrants,
  useProfile,
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

import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { Link } from 'src/components/Link';
import { RemovableSelectionsListTable } from 'src/components/RemovableSelectionsList/RemovableSelectionsListTable';
import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import { getDefaultFirewallForInterfacePurpose } from 'src/features/Linodes/LinodeCreate/Networking/utilities';
import {
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
  VPC_MULTIPLE_CONFIGURATIONS_LEARN_MORE_LINK,
} from 'src/features/VPCs/constants';
import { useUnassignLinode } from 'src/hooks/useUnassignLinode';
import { getErrorMap } from 'src/utilities/errorUtils';
import { SUBNET_LINODE_CSV_HEADERS } from 'src/utilities/subnets';

import {
  MULTIPLE_CONFIGURATIONS_MESSAGE,
  REGIONAL_LINODE_MESSAGE,
} from '../constants';
import {
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
  vpcRanges: string[] | undefined;
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
  const csvRef = React.useRef<any>();
  const newInterface = React.useRef<Interface | LinodeInterface>();
  const removedLinodeId = React.useRef<number>(-1);
  const formattedDate = useFormattedDate();
  const theme = useTheme();

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
  const [autoAssignIPv4, setAutoAssignIPv4] = React.useState<boolean>(true);

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);

  // @TODO VPC: this logic for vpc grants/perms appears a lot - commenting a todo here in case we want to move this logic to a parent component
  // there isn't a 'view VPC/Subnet' grant that does anything, so all VPCs get returned even for restricted users
  // with permissions set to 'None'. Therefore, we're treating those as read_only as well
  const userCannotAssignLinodes =
    Boolean(profile?.restricted) &&
    (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

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
      chosenIP,
      ipRanges,
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
      autoAssignIPv4,
      chosenIP,
      ipRanges,
      subnetId: subnet?.id,
      vpcId,
      isLinodeInterface,
    });

    try {
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

      const errorMap = getErrorMap(
        [...fieldsOfIPRangesErrors, 'ipv4.vpc', 'ip_ranges', 'firewall_id'],
        errors
      );

      const ipRangesWithErrors = ipRanges.map((ipRange, idx) => {
        const errorForThisIdx = errorMap[`ip_ranges[${idx}]`];
        return {
          address: ipRange.address,
          error: errorForThisIdx,
        };
      });

      setFieldValue('ipRanges', ipRangesWithErrors);

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
    setAutoAssignIPv4(!autoAssignIPv4);
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

  const { dirty, handleSubmit, resetForm, setFieldValue, setValues, values } =
    useFormik({
      enableReinitialize: true,
      initialValues: {
        chosenIP: '',
        ipRanges: [] as ExtendedIP[],
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

  const handleIPRangeChange = React.useCallback(
    (_ipRanges: ExtendedIP[]) => {
      setFieldValue('ipRanges', _ipRanges);
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
        vpcRanges: newInterface?.current
          ? 'vpc' in newInterface.current
            ? getLinodeInterfaceIPv4Ranges(newInterface.current)
            : newInterface.current?.ip_ranges
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
        chosenIP: '',
        ipRanges: [],
        selectedConfig: null,
        selectedLinode: null,
        selectedFirewall: defaultFirewall,
      });
    }
  }, [
    subnet,
    isLinodeInterface,
    assignedLinodesAndInterfaceData,
    values.ipRanges,
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
    setAutoAssignIPv4(true);
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
            {autoAssignIPv4 && assignLinodesErrors['ipv4.vpc'] && (
              <Notice spacingBottom={0} spacingTop={16} variant="error">
                <Typography>{assignLinodesErrors['ipv4.vpc']}</Typography>
              </Notice>
            )}
            <Box
              alignItems="center"
              display="flex"
              flexDirection="row"
              sx={(theme) => ({ marginLeft: theme.spacingFunction(2) })}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoAssignIPv4}
                    onChange={handleAutoAssignIPv4Change}
                  />
                }
                data-testid="vpc-ipv4-checkbox"
                disabled={userCannotAssignLinodes}
                label={
                  <Typography>
                    Auto-assign a VPC IPv4 address for this Linode
                  </Typography>
                }
                sx={{ marginRight: 0 }}
              />
              <TooltipIcon status="help" text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP} />
            </Box>
            {!autoAssignIPv4 && (
              <TextField
                disabled={userCannotAssignLinodes}
                errorText={assignLinodesErrors['ipv4.vpc']}
                label="VPC IPv4"
                onChange={(e) => {
                  setFieldValue('chosenIP', e.target.value);
                  setAssignLinodesErrors({});
                }}
                sx={(theme) => ({ marginBottom: theme.spacingFunction(8) })}
                value={values.chosenIP}
              />
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
            {/* Display the 'Assign additional IPv4 ranges' section if
                the Configuration Profile section has been populated, or
                if it doesn't display b/c the linode has a single config
            */}
            {((linodeConfigs.length > 1 && values.selectedConfig) ||
              linodeConfigs.length === 1 ||
              isLinodeInterface) && (
              <AssignIPRanges
                handleIPRangeChange={handleIPRangeChange}
                ipRanges={values.ipRanges}
                ipRangesError={assignLinodesErrors['ip_ranges']}
                sx={{
                  marginBottom: theme.spacingFunction(8),
                  marginTop:
                    linodeConfigs.length > 1
                      ? theme.spacingFunction(16)
                      : theme.spacingFunction(8),
                }}
              />
            )}
            {isLinodeInterface && (
              <>
                <Divider spacingBottom={8} spacingTop={8} />
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
        headerText={`Linodes recently assigned to Subnet (${assignedLinodesAndInterfaceData.length})`}
        noDataText={'No Linodes have been assigned.'}
        onRemove={(data) => {
          handleUnassignLinode(data as LinodeAndInterfaceData);
          setUnassignLinodesErrors([]);
        }}
        preferredDataLabel="linodeConfigLabel"
        selectionData={assignedLinodesAndInterfaceData}
        tableHeaders={['Linode', 'VPC IPv4', 'VPC IPv4 Ranges']}
      />
      {assignedLinodesAndInterfaceData.length > 0 && (
        <DownloadCSV
          buttonType="styledLink"
          csvRef={csvRef}
          data={assignedLinodesAndInterfaceData}
          filename={`linodes-assigned-${formattedDate}.csv`}
          headers={SUBNET_LINODE_CSV_HEADERS}
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
