import {
  appendConfigInterface,
  deleteLinodeConfigInterface,
  Config,
  InterfacePayload,
  InterfacePurpose,
  Linode,
  Subnet,
  APIError,
} from '@linode/api-v4';
import { useFormik } from 'formik';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { Drawer } from 'src/components/Drawer';
import { FormHelperText } from 'src/components/FormHelperText';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';

import { configQueryKey, interfaceQueryKey } from 'src/queries/linodes/configs';
import { queryKey, useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useGrants, useProfile } from 'src/queries/profile';
import { getAllLinodeConfigs } from 'src/queries/linodes/requests';
import { subnetQueryKey, vpcQueryKey } from 'src/queries/vpcs';

import { getErrorMap } from 'src/utilities/errorUtils';

import { StyledButtonBox } from './SubnetAssignLinodesDrawer.styles';

// @TODO VPC - if all subnet action menu item related components use this as their props, might be worth
// putting this in a common file and naming it something like SubnetActionMenuItemProps or somthing
interface Props {
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  vpcId: number;
  vpcRegion: string;
}

type LinodeAndConfigData = Linode & {
  configId: number;
  interfaceId: number;
};

const REBOOT_LINODE_MESSAGE =
  'Assigning a Linode to a subnet requires you to reboot the Linode to update its configuration.';
const REGIONAL_LINODE_MESSAGE = `Select the Linodes you would like to assign to this subnet. Only Linodes in this VPC's region are displayed.`;
const MULTIPLE_CONFIGURATIONS_MESSAGE =
  'This Linode has multiple configurations. Select which configuration you would like added to the subnet.';

export const SubnetAssignLinodesDrawer = (props: Props) => {
  const queryClient = useQueryClient();
  const { onClose, open, subnet, vpcId, vpcRegion } = props;

  const [assignLinodesErrors, setAssignLinodesErrors] = React.useState<
    Record<string, string | undefined>
  >({});

  const [unassignLinodesErrors, setUnassignLinodesErrors] = React.useState<
    APIError[]
  >([]);

  // We only want to keep track the linodes we've assigned to a subnet while this drawer is open, so
  // we need to store that information in local state instead of using the subnet's assigned linodes
  // (which keeps track of all linodes assigned to a subnet, not just the ones currently being assigned).
  // If we close the drawer and then reopen it, this value should be [].
  const [
    assignedLinodesAndConfigData,
    setAssignedLinodesAndConfigData,
  ] = React.useState<LinodeAndConfigData[]>([]);

  const [linodeConfigs, setLinodeConfigs] = React.useState<Config[]>([]);
  const [autoAssignIPv4, setAutoAssignIPv4] = React.useState<boolean>(true);

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);

  // there isn't a 'view VPC/Subnet' grant that does anything, so all VPCs get returned even for restricted users
  // with permissions set to 'None'. Therefore, we're treating those as read_only as well
  const userCannotAssignLinodes =
    Boolean(profile?.restricted) &&
    (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

  // We only want the linodes from the same region as the VPC
  const { data: linodes } = useAllLinodesQuery(
    {},
    {
      region: vpcRegion,
    }
  );

  // We want to invalidate any VPC/subnet related queries as well, since we're making changes to subnets
  const invalidateQueries = (linodeId: number, configId: number) => {
    queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
    queryClient.invalidateQueries([vpcQueryKey, 'vpc', vpcId]);
    queryClient.invalidateQueries([vpcQueryKey, 'vpc', vpcId, subnetQueryKey]);
    queryClient.invalidateQueries([
      queryKey,
      'linode',
      linodeId,
      configQueryKey,
      'config',
      configId,
      interfaceQueryKey,
    ]);
  };

  const onAssignLinode = async () => {
    const { selectedLinode, chosenIP, selectedConfig } = values;

    // if a linode has multiple configs, we force the user to choose one. Otherwise,
    // we just take the ID of the first config when assigning a linode.
    const configId =
      linodeConfigs.length > 1
        ? selectedConfig?.id ?? -1
        : linodeConfigs[0]?.id ?? -1;

    const interfacePayload: InterfacePayload = {
      purpose: 'vpc' as InterfacePurpose,
      label: null,
      ipam_address: null,
      subnet_id: subnet?.id,
      ...(!autoAssignIPv4 && { ipv4: { vpc: chosenIP } }),
    };

    try {
      const newInterface = await appendConfigInterface(
        selectedLinode?.id ?? -1,
        configId,
        interfacePayload
      );
      invalidateQueries(selectedLinode?.id ?? -1, configId);
      resetForm();
      setLinodeConfigs([]);
      if (selectedLinode) {
        setAssignedLinodesAndConfigData([
          ...assignedLinodesAndConfigData,
          {
            ...selectedLinode,
            configId,
            interfaceId: newInterface.id,
            label: `${selectedLinode?.label}${
              selectedConfig?.label ? ` (${selectedConfig.label})` : ''
            }`,
          },
        ]);
      }
      setValues({
        selectedLinode: null,
        chosenIP: '',
        selectedConfig: null,
      });
    } catch (errors) {
      // potential todo: the api error for not selecting a linode/config isn't very friendly -- just throws
      // 'Not found', will look into making this nicer
      const newErrors = getErrorMap(['ipv4.vpc'], errors);
      setAssignLinodesErrors(newErrors);
    }
  };

  const onUnassignLinode = async (data: LinodeAndConfigData) => {
    const { id: linodeId, configId, interfaceId } = data;
    try {
      await deleteLinodeConfigInterface(linodeId, configId, interfaceId);
      setAssignedLinodesAndConfigData(
        [...assignedLinodesAndConfigData].filter(
          (linode) => linode.id !== linodeId
        )
      );
      invalidateQueries(data.id, data.configId);
      queryClient.invalidateQueries([
        queryKey,
        'linode',
        linodeId,
        configQueryKey,
        'config',
        configId,
        interfaceQueryKey,
      ]);
      queryClient.removeQueries([
        queryKey,
        'linode',
        linodeId,
        configQueryKey,
        'config',
        configId,
        interfaceQueryKey,
        'interface',
        interfaceId,
      ]);
    } catch (errors) {
      setUnassignLinodesErrors(errors as APIError[]);
    }
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
      selectedLinode: null as Linode | null,
      chosenIP: '',
      selectedConfig: null as Config | null,
    },
    onSubmit: onAssignLinode,
    validateOnBlur: false,
    validateOnChange: false,
  });

  const getLinodeConfigData = React.useCallback(
    async (linode: Linode | null) => {
      if (linode) {
        try {
          const data = await getAllLinodeConfigs(linode.id);
          setLinodeConfigs(data);
        } catch (errors) {
          // force error to appear at top of page
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

  React.useEffect(() => {
    if (open) {
      resetForm();
      setAssignedLinodesAndConfigData([]);
      setLinodeConfigs([]);
      setAssignLinodesErrors({});
      setUnassignLinodesErrors([]);
      setAutoAssignIPv4(true);
    }
  }, [open]);

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Assign Linodes to subnet: ${subnet?.label} (${subnet?.ipv4})`}
    >
      {assignLinodesErrors.none && (
        <Notice text={assignLinodesErrors.none} variant="error" />
      )}
      {userCannotAssignLinodes && (
        <Notice
          important
          text={`You don't have permissions to assign Linodes to ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      <Notice variant="warning" text={`${REBOOT_LINODE_MESSAGE}`} />
      <form onSubmit={handleSubmit}>
        <FormHelperText>{REGIONAL_LINODE_MESSAGE}</FormHelperText>
        <Autocomplete
          disabled={userCannotAssignLinodes}
          inputValue={values.selectedLinode?.label || ''}
          label={'Linodes'}
          onChange={(_, value: Linode) => {
            setFieldValue('selectedLinode', value);
            setAssignLinodesErrors({});
          }}
          // We only want to be able to assign linodes that were not already assigned
          options={
            linodes?.filter(
              (linode) =>
                !assignedLinodesAndConfigData
                  .map((data) => data.id)
                  .includes(linode.id) && !subnet?.linodes.includes(linode.id)
            ) ?? []
          }
          placeholder="Select Linodes or type to search"
          value={values.selectedLinode || null}
          sx={{ marginBottom: '8px' }}
        />
        <Checkbox
          checked={autoAssignIPv4}
          disabled={userCannotAssignLinodes}
          text={'Auto-assign a VPC IPv4 address for this Linode'}
          toolTipText={
            'A range of non-internet facing IP used in an internal network'
          }
          onChange={(_) => setAutoAssignIPv4(!autoAssignIPv4)}
          sx={{ marginLeft: `2px`, marginTop: `8px` }}
        />
        {!autoAssignIPv4 && (
          <TextField
            disabled={userCannotAssignLinodes}
            errorText={assignLinodesErrors['ipv4.vpc']}
            label={'VPC IPv4'}
            onChange={(e) => {
              setFieldValue('chosenIP', e.target.value);
              setAssignLinodesErrors({});
            }}
            sx={{ marginBottom: '8px' }}
            value={values.chosenIP}
          />
        )}
        {linodeConfigs.length > 1 && (
          <>
            <FormHelperText sx={{ marginTop: `16px` }}>
              {MULTIPLE_CONFIGURATIONS_MESSAGE}
              {/* @TODO: VPC - add docs link */}
              <Link to="#"> Learn more</Link>.
            </FormHelperText>
            <Autocomplete
              disabled={userCannotAssignLinodes}
              inputValue={values.selectedConfig?.label || ''}
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
        <StyledButtonBox>
          <Button
            buttonType="primary"
            disabled={userCannotAssignLinodes || !dirty}
            type="submit"
          >
            Assign Linode
          </Button>
        </StyledButtonBox>
      </form>
      {/* @TODO VPC: currently using autocomplete for this (which is pretty interesting), but will eventually replace with a List + download CSV as well */}
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
      <Autocomplete
        clearOnBlur
        clearOnEscape
        disabled={userCannotAssignLinodes}
        inputValue={''}
        label={`Linodes Assigned to Subnet (${assignedLinodesAndConfigData.length})`}
        onChange={(_, value: LinodeAndConfigData) => {
          onUnassignLinode(value);
          setUnassignLinodesErrors([]);
        }}
        options={assignedLinodesAndConfigData}
        placeholder="Select a Linode to unassign"
      />
      <StyledButtonBox>
        <Button buttonType="outlined" onClick={onClose}>
          Done
        </Button>
      </StyledButtonBox>
    </Drawer>
  );
};
