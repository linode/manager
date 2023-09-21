import { appendConfigInterface } from '@linode/api-v4';
import Close from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { Drawer } from 'src/components/Drawer';
import { FormHelperText } from 'src/components/FormHelperText';
import { IconButton } from 'src/components/IconButton';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
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
import {
  SelectedOptionsHeader,
  SelectedOptionsList,
  SelectedOptionsListItem,
  StyledButtonBox,
  StyledLabel,
  StyledNoAssignedLinodesBox,
} from './SubnetAssignLinodesDrawer.styles';

import type {
  APIError,
  Config,
  InterfacePayload,
  InterfacePurpose,
  Linode,
  Subnet,
} from '@linode/api-v4';

// @TODO VPC: if all subnet action menu item related components use (most of) this as their props, might be worth
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
  configLabel: string;
  interfaceId: number;
};

export const SubnetAssignLinodesDrawer = (props: Props) => {
  console.log('this is the subnet', props.subnet)
  const { onClose, open, subnet, vpcId, vpcRegion } = props;
  const {
    invalidateQueries,
    unassignLinode,
    unassignLinodesErrors,
    setUnassignLinodesErrors,
  } = useUnassignLinode();
  const csvRef = React.useRef<any>();
  const formattedDate = useFormattedDate();

  const [assignLinodesErrors, setAssignLinodesErrors] = React.useState<
    Record<string, string | undefined>
  >({});

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

  const csvHeaders = [
    { key: 'label', label: 'Linode Label' },
    { key: 'ipv4', label: 'IPv4' },
    { key: 'id', label: 'Linode ID' },
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
  const findUnassignedLinodes = () => {
    return linodes?.filter((linode) => {
      return !subnet?.linodes.includes(linode.id);
    });
  };

  const onAssignLinode = async () => {
    const { chosenIP, selectedConfig, selectedLinode } = values;

    // if a linode has multiple configs, we force the user to choose one. Otherwise,
    // we just take the ID of the first (the only) config when assigning a linode.
    const configId =
      (linodeConfigs.length > 1 ? selectedConfig?.id : linodeConfigs[0]?.id) ??
      -1;

    const interfacePayload: InterfacePayload = {
      ipam_address: null,
      label: null,
      purpose: 'vpc' as InterfacePurpose,
      subnet_id: subnet?.id,
      ...(!autoAssignIPv4 && { ipv4: { vpc: chosenIP } }),
    };

    try {
      const newInterface = await appendConfigInterface(
        selectedLinode?.id ?? -1,
        configId,
        interfacePayload
      );
      await invalidateQueries({
        configId,
        linodeId: selectedLinode?.id ?? -1,
        subnetId: subnet?.id ?? -1,
        vpcId,
      });
      resetForm();
      setLinodeConfigs([]);
      if (selectedLinode) {
        setAssignedLinodesAndConfigData([
          ...assignedLinodesAndConfigData,
          {
            ...selectedLinode,
            configId,
            configLabel: `${selectedLinode.label}${
              selectedConfig?.label ? ` (${selectedConfig.label})` : ''
            }`,
            interfaceId: newInterface.id,
          },
        ]);
      }
      setValues({
        chosenIP: '',
        selectedConfig: null,
        selectedLinode: null,
      });
    } catch (errors) {
      // if a linode/config is not selected, the error returned isn't very friendly: it just says 'Not found', so added friendlier errors here
      const newErrors = getErrorMap(['ipv4.vpc'], errors);
      if (newErrors.none) {
        if (!selectedLinode) {
          newErrors.none = 'No Linode selected';
        } else if (configId === -1) {
          newErrors.none =
            linodeConfigs.length === 0
              ? 'Selected linode must have at least one configuration profile'
              : 'No configuration profile selected';
        } // no else case: leave room for other errors unrelated to unselected linode/config
      }
      setAssignLinodesErrors(newErrors);
    }
  };

  const onUnassignLinode = async (data: LinodeAndConfigData) => {
    const { configId, id: linodeId, interfaceId } = data;
    try {
      await unassignLinode({
        configId,
        interfaceId,
        linodeId,
        subnetId: subnet?.id ?? -1,
        vpcId,
      });
      setAssignedLinodesAndConfigData(
        [...assignedLinodesAndConfigData].filter(
          (linode) => linode.id !== linodeId
        )
      );
    } catch (errors) {
      setUnassignLinodesErrors(errors as APIError[])
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
      chosenIP: '',
      selectedConfig: null as Config | null,
      selectedLinode: null as Linode | null,
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

  React.useEffect(() => {
    if (open) {
      resetForm();
      setAssignedLinodesAndConfigData([]);
      setLinodeConfigs([]);
      setAssignLinodesErrors({});
      setUnassignLinodesErrors([]);
      setAutoAssignIPv4(true);
    }
  }, [open, resetForm]);

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Assign Linodes to subnet: ${subnet?.label} (${subnet?.ipv4})`}
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
          options={findUnassignedLinodes() ?? []}
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
          onChange={(_) => setAutoAssignIPv4(!autoAssignIPv4)}
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
            buttonType="primary"
            disabled={userCannotAssignLinodes || !dirty}
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
      <SelectedOptionsHeader>{`Linodes Assigned to Subnet (${assignedLinodesAndConfigData.length})`}</SelectedOptionsHeader>
      {assignedLinodesAndConfigData.length > 0 ? (
        <SelectedOptionsList>
          {assignedLinodesAndConfigData.map((linodeAndConfigData) => (
            <SelectedOptionsListItem
              alignItems="center"
              key={linodeAndConfigData.id}
            >
              <StyledLabel>{linodeAndConfigData.configLabel}</StyledLabel>
              <IconButton
                onClick={() => {
                  onUnassignLinode(linodeAndConfigData);
                  setUnassignLinodesErrors([]);
                }}
                aria-label={`remove ${linodeAndConfigData.configLabel}`}
                disableRipple
                size="medium"
              >
                <Close />
              </IconButton>
            </SelectedOptionsListItem>
          ))}
        </SelectedOptionsList>
      ) : (
        <StyledNoAssignedLinodesBox>
          <StyledLabel>No Linodes have been assigned.</StyledLabel>
        </StyledNoAssignedLinodesBox>
      )}
      <DownloadCSV
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 1,
          marginTop: 2,
          textAlign: 'left',
        }}
        buttonType="unstyled"
        csvRef={csvRef}
        data={assignedLinodesAndConfigData}
        filename={`linodes-assigned-${formattedDate}.csv`}
        headers={csvHeaders}
        onClick={downloadCSV}
        text={'Download List of Assigned Linodes (.csv)'}
      />
      <StyledButtonBox>
        <Button buttonType="outlined" onClick={onClose}>
          Done
        </Button>
      </StyledButtonBox>
    </Drawer>
  );
};
