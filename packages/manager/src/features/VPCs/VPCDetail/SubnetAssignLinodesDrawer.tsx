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
  Drawer,
  FormControlLabel,
  FormHelperText,
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
import { NotFound } from 'src/components/NotFound';
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
  ASSIGN_LINODES_DRAWER_REBOOT_MESSAGE,
  MULTIPLE_CONFIGURATIONS_MESSAGE,
  REGIONAL_LINODE_MESSAGE,
} from '../constants';
import {
  getVPCInterfacePayload,
  mapInterfaceDataToDownloadableData,
} from '../utils';
import { AssignIPRanges } from './AssignIPRanges';
import { StyledButtonBox } from './SubnetAssignLinodesDrawer.styles';

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
  vpcId: number;
  vpcRegion: string;
}

export interface LinodeAndConfigData extends Linode {
  configId: null | number;
  interfaceData: Interface | LinodeInterface | undefined;
  linodeConfigLabel: string;
}

export const SubnetAssignLinodesDrawer = (
  props: SubnetAssignLinodesDrawerProps
) => {
  const { isFetching, onClose, open, subnet, vpcId, vpcRegion } = props;
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
  const [assignedLinodesAndConfigData, setAssignedLinodesAndConfigData] =
    React.useState<LinodeAndConfigData[]>([]);
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
  function getConfigId(linodeConfigs: Config[], selectedConfig: Config | null) {
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

    const isLinodeInterface = selectedLinode?.interface_generation === 'linode';
    const configId = getConfigId(linodeConfigs, selectedConfig);
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
            configId,
            defaultPublicInterface
          );
        }

        _newInterface = await appendConfigInterface(
          selectedLinode?.id ?? -1,
          configId,
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
      // todo: YIKES
      const fieldsOfIPRangesErrors = errors.reduce(
        (accum: any, _err: { field: string }) => {
          if (_err.field && _err.field.includes('ip_ranges[')) {
            return [...accum, _err.field];
          } else {
            return [...accum];
          }
        },
        []
      );

      const errorMap = getErrorMap(
        [...fieldsOfIPRangesErrors, 'ipv4.vpc', 'ip_ranges'],
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

  const handleUnassignLinode = async (data: LinodeAndConfigData) => {
    const { configId, id: linodeId, interfaceData } = data;
    removedLinodeId.current = linodeId;
    try {
      await unassignLinode({
        configId,
        interfaceId: interfaceData?.id ?? -1,
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
  const determineErrorMessage = (
    configId: number,
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
      const isLinodeInterface =
        values.selectedLinode.interface_generation === 'linode';
      const configId = isLinodeInterface
        ? getConfigId(linodeConfigs, values.selectedConfig)
        : null;

      // Construct a new Linode data object with additional properties
      const newLinodeData = {
        ...values.selectedLinode,
        configId,
        interfaceData: newInterface?.current,
        // Create a label that combines Linode label and configuration label (if available)
        linodeConfigLabel: `${values.selectedLinode.label}${
          values.selectedConfig?.label && !isLinodeInterface
            ? ` (${values.selectedConfig.label})`
            : ''
        }`,
      };

      // Add the new Linode data to the list of assigned Linodes and configurations
      setAssignedLinodesAndConfigData([
        ...assignedLinodesAndConfigData,
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
    assignedLinodesAndConfigData,
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
      !!assignedLinodesAndConfigData.find(
        (data) => data.id === removedLinodeId.current
      );

    if (isLinodeToRemoveValid) {
      setAssignedLinodesAndConfigData(
        [...assignedLinodesAndConfigData].filter(
          (linode) => linode.id !== removedLinodeId.current
        )
      );
    }
  }, [subnet, assignedLinodesAndConfigData]);

  const getLinodeConfigData = React.useCallback(
    async (linode: Linode | null) => {
      if (linode && linode.interface_generation === 'legacy_config') {
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
    setAssignedLinodesAndConfigData([]);
    setLinodeConfigs([]);
    setAssignLinodesErrors({});
    setUnassignLinodesErrors([]);
    setAutoAssignIPv4(true);
  };

  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
      onClose={handleOnClose}
      open={open}
      title={`Assign Linodes to subnet: ${subnet?.label} (${
        subnet?.ipv4 ?? subnet?.ipv6
      })`}
    >
      {userCannotAssignLinodes && (
        <Notice
          important
          text={`You don't have permissions to assign Linodes to ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      {assignLinodesErrors.none && (
        <Notice text={assignLinodesErrors.none} variant="error" />
      )}
      <Notice
        spacingBottom={16}
        text={`${ASSIGN_LINODES_DRAWER_REBOOT_MESSAGE}`}
        variant="warning"
      />
      <form onSubmit={handleSubmit}>
        <FormHelperText>{REGIONAL_LINODE_MESSAGE}</FormHelperText>
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
            {linodeConfigs.length > 1 &&
              values.selectedLinode.interface_generation ===
                'legacy_config' && (
                <>
                  <FormHelperText sx={{ marginTop: `16px` }}>
                    {MULTIPLE_CONFIGURATIONS_MESSAGE}{' '}
                    <Link to={VPC_MULTIPLE_CONFIGURATIONS_LEARN_MORE_LINK}>
                      Learn more
                    </Link>
                    .
                  </FormHelperText>
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
              values.selectedLinode.interface_generation === 'linode') && (
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
            {values.selectedLinode.interface_generation === 'linode' && (
              <FirewallSelect
                disableClearable
                label="VPC Interface Firewall"
                onChange={(e, firewall) =>
                  setFieldValue('selectedFirewall', firewall?.id)
                }
                value={values.selectedFirewall}
              />
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
              (values.selectedLinode.interface_generation === 'legacy_config' &&
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
        headerText={`Linodes recently assigned to Subnet (${assignedLinodesAndConfigData.length})`}
        noDataText={'No Linodes have been assigned.'}
        onRemove={(data) => {
          handleUnassignLinode(data as LinodeAndConfigData);
          setUnassignLinodesErrors([]);
        }}
        preferredDataLabel="linodeConfigLabel"
        selectionData={assignedLinodesAndConfigData}
        tableHeaders={['Linode', 'VPC IPv4', 'VPC IPv4 Ranges']}
      />
      {assignedLinodesAndConfigData.length > 0 && (
        <DownloadCSV
          buttonType="styledLink"
          csvRef={csvRef}
          data={mapInterfaceDataToDownloadableData(
            assignedLinodesAndConfigData
          )}
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
