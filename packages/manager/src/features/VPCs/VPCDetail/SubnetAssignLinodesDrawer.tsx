import { appendConfigInterface } from '@linode/api-v4';
import { useFormik } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { Drawer } from 'src/components/Drawer';
import { FormHelperText } from 'src/components/FormHelperText';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { RemovableSelectionsList } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { TextField } from 'src/components/TextField';
import { useFormattedDate } from 'src/hooks/useFormattedDate';
import { useUnassignLinode } from 'src/hooks/useUnassignLinode';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { getAllLinodeConfigs } from 'src/queries/linodes/requests';
import { useGrants, useProfile } from 'src/queries/profile';
import { getErrorMap } from 'src/utilities/errorUtils';

import {
  ASSIGN_LINODES_DRAWER_REBOOT_MESSAGE,
  MULTIPLE_CONFIGURATIONS_MESSAGE,
  REGIONAL_LINODE_MESSAGE,
} from '../constants';
import { StyledButtonBox } from './SubnetAssignLinodesDrawer.styles';

import type {
  APIError,
  Config,
  InterfacePayload,
  Linode,
  Subnet,
} from '@linode/api-v4';

// @TODO VPC: if all subnet action menu item related components use (most of) this as their props, might be worth
// putting this in a common file and naming it something like SubnetActionMenuItemProps or somthing
interface SubnetAssignLinodesDrawerProps {
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  vpcId: number;
  vpcRegion: string;
}

type LinodeAndConfigData = Linode & {
  configId: number;
  interfaceId: number;
  linodeConfigLabel: string;
};

export const SubnetAssignLinodesDrawer = (
  props: SubnetAssignLinodesDrawerProps
) => {
  const { onClose, open, subnet, vpcId, vpcRegion } = props;
  const {
    invalidateQueries,
    setUnassignLinodesErrors,
    unassignLinode,
    unassignLinodesErrors,
  } = useUnassignLinode();
  const csvRef = React.useRef<any>();
  const newInterfaceId = React.useRef<number>(-1);
  const removedLinodeId = React.useRef<number>(-1);
  const formattedDate = useFormattedDate();

  const [assignLinodesErrors, setAssignLinodesErrors] = React.useState<
    Record<string, string | undefined>
  >({});

  // While the drawer is open, we maintain a local list of assigned Linodes.
  // This is distinct from the subnet's global list of assigned Linodes, which encompasses all assignments.
  // The local list resets to empty when the drawer is closed and reopened.
  const [
    assignedLinodesAndConfigData,
    setAssignedLinodesAndConfigData,
  ] = React.useState<LinodeAndConfigData[]>([]);
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

  const csvHeaders = [
    { key: 'label', label: 'Linode Label' },
    { key: 'id', label: 'Linode ID' },
    { key: 'ipv4', label: 'IPv4' },
  ];

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
      return !subnet?.linodes.includes(linode.id);
    });
  }, [subnet, linodes]);

  const [linodeOptionsToAssign, setLinodeOptionsToAssign] = React.useState<
    Linode[]
  >([]);

  // Moved the list of linodes that are currently assignable to a subnet into a state variable (linodeOptionsToAssign)
  // and update that list whenever this subnet or the list of all linodes in this subnet's region changes. This takes
  // care of the MUI invalid value warning that was occuring before in the Linodes autocomplete [M3-6752]
  React.useEffect(() => {
    if (linodes) {
      setLinodeOptionsToAssign(findUnassignedLinodes() ?? []);
    }
  }, [linodes, setLinodeOptionsToAssign, findUnassignedLinodes]);

  // Determine the configId based on the number of configurations
  function getConfigId(linodeConfigs: Config[], selectedConfig: Config | null) {
    return (
      (linodeConfigs.length > 1
        ? selectedConfig?.id // Use selected configuration's id if available
        : linodeConfigs[0]?.id) ?? -1 // Use the first configuration's id or -1 if no configurations
    );
  }

  const handleAssignLinode = async () => {
    const { chosenIP, selectedConfig, selectedLinode } = values;

    const configId = getConfigId(linodeConfigs, selectedConfig);

    const interfacePayload: InterfacePayload = {
      ipam_address: null,
      label: null,
      purpose: 'vpc',
      subnet_id: subnet?.id,
      ...(!autoAssignIPv4 && { ipv4: { vpc: chosenIP } }),
    };

    try {
      const newInterface = await appendConfigInterface(
        selectedLinode?.id ?? -1,
        configId,
        interfacePayload
      );

      // We're storing this in a ref to access this later in order
      // to update `assignedLinodesAndConfigData` with the new
      // interfaceId without causing a re-render
      newInterfaceId.current = newInterface.id;

      await invalidateQueries({
        configId,
        linodeId: selectedLinode?.id ?? -1,
        subnetId: subnet?.id ?? -1,
        vpcId,
      });
    } catch (errors) {
      const errorMap = getErrorMap(['ipv4.vpc'], errors);
      const errorMessage = determineErrorMessage(configId, errorMap);

      setAssignLinodesErrors({ ...errorMap, none: errorMessage });
    }
  };

  const handleUnassignLinode = async (data: LinodeAndConfigData) => {
    const { configId, id: linodeId, interfaceId } = data;
    removedLinodeId.current = linodeId;
    try {
      await unassignLinode({
        configId,
        interfaceId,
        linodeId,
        subnetId: subnet?.id ?? -1,
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

  const {
    dirty,
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      chosenIP: '',
      selectedConfig: null as Config | null,
      selectedLinode: null as Linode | null,
    },
    onSubmit: handleAssignLinode,
    validateOnBlur: false,
    validateOnChange: false,
  });

  React.useEffect(() => {
    // Return early if no Linode is selected
    if (!values.selectedLinode) {
      return;
    }
    // Check if the selected Linode is already assigned to the subnet
    if (
      values.selectedLinode &&
      subnet?.linodes.includes(values.selectedLinode.id)
    ) {
      const configId = getConfigId(linodeConfigs, values.selectedConfig);

      // Construct a new Linode data object with additional properties
      const newLinodeData = {
        ...values.selectedLinode,
        configId,
        interfaceId: newInterfaceId.current,
        // Create a label that combines Linode label and configuration label (if available)
        linodeConfigLabel: `${values.selectedLinode.label}${
          values.selectedConfig?.label
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
        selectedConfig: null,
        selectedLinode: null,
      });
    }
  }, [
    subnet,
    assignedLinodesAndConfigData,
    values.selectedLinode,
    values.selectedConfig,
    linodeConfigs,
    resetForm,
    setLinodeConfigs,
    setValues,
  ]);

  React.useEffect(() => {
    // if a linode is not assigned to the subnet but is in assignedLinodesAndConfigData,
    // we want to remove it from assignedLinodesAndConfigData
    const isLinodeToRemoveValid =
      removedLinodeId.current !== -1 &&
      !subnet?.linodes.includes(removedLinodeId.current) &&
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
      if (linode) {
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
      title={`Assign Linodes to subnet: ${subnet?.label} (${
        subnet?.ipv4 ?? subnet?.ipv6
      })`}
      onClose={handleOnClose}
      open={open}
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
        text={`${ASSIGN_LINODES_DRAWER_REBOOT_MESSAGE}`}
        variant="warning"
      />
      <form onSubmit={handleSubmit}>
        <FormHelperText>{REGIONAL_LINODE_MESSAGE}</FormHelperText>
        <Autocomplete
          onChange={(_, value: Linode) => {
            setFieldValue('selectedLinode', value);
            setAssignLinodesErrors({});
          }}
          disabled={userCannotAssignLinodes}
          inputValue={values.selectedLinode?.label || ''}
          label={'Linodes'}
          // We only want to be able to assign linodes that were not already assigned to this subnet
          options={linodeOptionsToAssign}
          placeholder="Select Linodes or type to search"
          sx={{ marginBottom: '8px' }}
          value={values.selectedLinode || null}
        />
        <Checkbox
          toolTipText={
            'A range of non-internet facing IP used in an internal network'
          }
          checked={autoAssignIPv4}
          disabled={userCannotAssignLinodes}
          onChange={handleAutoAssignIPv4Change}
          sx={{ marginLeft: `2px`, marginTop: `8px` }}
          text={'Auto-assign a VPC IPv4 address for this Linode'}
        />
        {!autoAssignIPv4 && (
          <TextField
            onChange={(e) => {
              setFieldValue('chosenIP', e.target.value);
              setAssignLinodesErrors({});
            }}
            disabled={userCannotAssignLinodes}
            errorText={assignLinodesErrors['ipv4.vpc']}
            label={'VPC IPv4'}
            sx={{ marginBottom: '8px' }}
            value={values.chosenIP}
          />
        )}
        {linodeConfigs.length > 1 && (
          <>
            <FormHelperText sx={{ marginTop: `16px` }}>
              {MULTIPLE_CONFIGURATIONS_MESSAGE}
              {/* @TODO VPC: add docs link */}
              <Link to="#"> Learn more</Link>.
            </FormHelperText>
            <Autocomplete
              onChange={(_, value: Config) => {
                setFieldValue('selectedConfig', value);
                setAssignLinodesErrors({});
              }}
              disabled={userCannotAssignLinodes}
              inputValue={values.selectedConfig?.label || ''}
              label={'Configuration profile'}
              options={linodeConfigs}
              placeholder="Select a configuration profile"
              value={values.selectedConfig || null}
            />
          </>
        )}
        <StyledButtonBox>
          <Button
            disabled={
              userCannotAssignLinodes ||
              !dirty ||
              !values.selectedLinode ||
              (linodeConfigs.length > 1 && !values.selectedConfig)
            }
            buttonType="primary"
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
      <RemovableSelectionsList
        onRemove={(data) => {
          handleUnassignLinode(data as LinodeAndConfigData);
          setUnassignLinodesErrors([]);
        }}
        headerText={`Linodes Assigned to Subnet (${assignedLinodesAndConfigData.length})`}
        noDataText={'No Linodes have been assigned.'}
        preferredDataLabel="linodeConfigLabel"
        selectionData={assignedLinodesAndConfigData}
      />
      <DownloadCSV
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 1,
          marginTop: 2,
          textAlign: 'left',
        }}
        buttonType="styledLink"
        csvRef={csvRef}
        data={assignedLinodesAndConfigData}
        filename={`linodes-assigned-${formattedDate}.csv`}
        headers={csvHeaders}
        onClick={downloadCSV}
        text={'Download List of Assigned Linodes (.csv)'}
      />
      <StyledButtonBox>
        <Button buttonType="outlined" onClick={handleOnClose}>
          Done
        </Button>
      </StyledButtonBox>
    </Drawer>
  );
};
