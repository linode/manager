import {
  InterfacePayload,
  InterfacePurpose,
} from '@linode/api-v4/lib/linodes/types';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Divider } from 'src/components/Divider';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { VPCPanel } from 'src/features/Linodes/LinodesCreate/VPCPanel';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { useVlansQuery } from 'src/queries/vlans';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';

interface Props {
  errors: VPCInterfaceErrors & OtherInterfaceErrors;
  fromAddonsPanel?: boolean;
  handleChange: (updatedInterface: ExtendedInterface) => void;
  ipamAddress?: null | string;
  label?: null | string;
  purpose: ExtendedPurpose;
  readOnly: boolean;
  region?: string;
  regionHasVLANs?: boolean;
  regionHasVPCs?: boolean;
  slotNumber: number;
}
interface VPCInterfaceErrors {
  labelError?: string;
  publicIPv4Error?: string;
  subnetError?: string;
  vpcError?: string;
  vpcIPv4Error?: string;
}

interface OtherInterfaceErrors {
  ipamError?: string;
  primaryError?: string;
}

interface VPCState {
  nattedIPv4Address?: string;
  subnetId?: null | number;
  vpcIPv4?: string;
  vpcId?: null | number;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = 'none' | InterfacePurpose;
export interface ExtendedInterface
  extends Partial<Omit<InterfacePayload, 'purpose'>> {
  purpose: ExtendedPurpose;
}

type CombinedProps = Props & VPCState;

export const InterfaceSelect = (props: CombinedProps) => {
  const {
    errors,
    fromAddonsPanel,
    handleChange,
    ipamAddress,
    label,
    nattedIPv4Address,
    purpose,
    readOnly,
    region,
    regionHasVLANs,
    regionHasVPCs,
    slotNumber,
    subnetId,
    vpcIPv4,
    vpcId,
  } = props;

  const theme = useTheme();
  const isSmallBp = useMediaQuery(
    theme.breakpoints.down(fromAddonsPanel ? 'sm' : 1015)
  );
  const flags = useFlags();
  const { data: account } = useAccount();

  const showVPCs = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  const [newVlan, setNewVlan] = React.useState('');
  const purposeOptions = getPurposeOptions(showVPCs);

  const { data: vlans, isLoading } = useVlansQuery();
  const vlanOptions =
    vlans
      ?.filter((thisVlan) => {
        // If a region is provided, only show VLANs in the target region as options
        return region ? thisVlan.region === region : true;
      })
      .map((thisVlan) => ({
        label: thisVlan.label,
        value: thisVlan.label,
      })) ?? [];

  if (Boolean(newVlan)) {
    vlanOptions.push({ label: newVlan, value: newVlan });
  }

  const [autoAssignVPCIPv4, setAutoAssignVPCIPv4] = React.useState(
    !Boolean(vpcIPv4)
  );
  const [autoAssignLinodeIPv4, setAutoAssignLinodeIPv4] = React.useState(
    Boolean(nattedIPv4Address)
  );

  const handlePurposeChange = (selected: Item<InterfacePurpose>) => {
    const purpose = selected.value;
    handleChange({
      ipam_address: purpose === 'vlan' ? ipamAddress : '',
      label: purpose === 'vlan' ? label : '',
      purpose,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ ipam_address: e.target.value, label, purpose });

  const handleLabelChange = (selected: Item<string>) =>
    handleChange({
      ipam_address: ipamAddress,
      label: selected?.value ?? '',
      purpose,
    });

  const handleVPCLabelChange = (selectedVPCId: number) => {
    // Only clear VPC related fields if VPC selection changes
    if (selectedVPCId !== vpcId) {
      handleChange({
        ipam_address: null,
        ipv4: {
          nat_1_1: autoAssignLinodeIPv4 ? 'any' : undefined,
          vpc: autoAssignVPCIPv4 ? undefined : vpcIPv4,
        },
        label: null,
        purpose,
        subnet_id: undefined,
        vpc_id: selectedVPCId,
      });
    }
  };

  const handleSubnetChange = (selectedSubnetId: number) =>
    handleChange({
      ipam_address: null,
      ipv4: {
        nat_1_1: autoAssignLinodeIPv4 ? 'any' : undefined,
        vpc: autoAssignVPCIPv4 ? undefined : vpcIPv4,
      },
      label: null,
      purpose,
      subnet_id: selectedSubnetId,
      vpc_id: vpcId,
    });

  const handleVPCIPv4Input = (vpcIPv4Input: string) => {
    const changeObj = {
      ipam_address: null,
      label: null,
      purpose,
      subnet_id: subnetId,
      vpc_id: vpcId,
    };
    if (autoAssignLinodeIPv4) {
      handleChange({
        ...changeObj,
        ipv4: {
          nat_1_1: 'any',
          vpc: vpcIPv4Input,
        },
      });
    } else {
      handleChange({
        ...changeObj,
        ipv4: {
          vpc: vpcIPv4Input,
        },
      });
    }
  };

  React.useEffect(() => {
    if (purpose !== 'vpc') {
      return handleChange({
        ipam_address: ipamAddress,
        label,
        purpose,
      });
    }

    const changeObj = {
      ipam_address: null,
      label: null,
      purpose,
      subnet_id: subnetId,
      vpc_id: vpcId,
    };

    /**
     * If a user checks the "Auto-assign a VPC IPv4 address" box, then we send the user inputted address, otherwise we send nothing/undefined.
     * If a user checks the "Assign a public IPv4" address box, then we send nat_1_1: 'any' to the API for auto assignment.
     */
    if (!autoAssignVPCIPv4 && autoAssignLinodeIPv4) {
      handleChange({
        ...changeObj,
        ipv4: {
          nat_1_1: 'any',
          vpc: vpcIPv4,
        },
      });
    } else if (
      (autoAssignVPCIPv4 && autoAssignLinodeIPv4) ||
      autoAssignLinodeIPv4
    ) {
      handleChange({
        ...changeObj,
        ipv4: {
          nat_1_1: 'any',
        },
      });
    } else if (autoAssignVPCIPv4 && !autoAssignLinodeIPv4) {
      handleChange({
        ...changeObj,
      });
    } else if (!autoAssignLinodeIPv4 && !autoAssignVPCIPv4) {
      handleChange({
        ...changeObj,
        ipv4: {
          vpc: vpcIPv4,
        },
      });
    }
  }, [autoAssignVPCIPv4, autoAssignLinodeIPv4, purpose]);

  const handleCreateOption = (_newVlan: string) => {
    setNewVlan(_newVlan);
    handleChange({
      ipam_address: ipamAddress,
      label: _newVlan,
      purpose,
    });
  };

  const jsxSelectVLAN = (
    <Select
      noOptionsMessage={() =>
        isLoading
          ? 'Loading...'
          : 'You have no VLANs in this region. Type to create one.'
      }
      creatable
      createOptionPosition="first"
      errorText={errors.labelError}
      inputId={`vlan-label-${slotNumber}`}
      isClearable
      isDisabled={readOnly}
      label="VLAN"
      onChange={handleLabelChange}
      onCreateOption={handleCreateOption}
      options={vlanOptions}
      placeholder="Create or select a VLAN"
      value={vlanOptions.find((thisVlan) => thisVlan.value === label) ?? null}
    />
  );

  const jsxIPAMForVLAN = (
    <TextField
      tooltipOnMouseEnter={() =>
        sendLinodeCreateDocsEvent('IPAM Address Tooltip Hover')
      }
      tooltipText={
        'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
      }
      disabled={readOnly}
      errorText={errors.ipamError}
      inputId={`ipam-input-${slotNumber}`}
      label="IPAM Address"
      onChange={handleAddressChange}
      optional
      placeholder="192.0.2.0/24"
      value={ipamAddress}
    />
  );

  const enclosingJSXForVLANFields = (
    jsxSelectVLAN: JSX.Element,
    jsxIPAMForVLAN: JSX.Element
  ) => {
    return fromAddonsPanel ? (
      <Grid container>
        <Grid
          sx={{
            flexDirection: 'row',
            [theme.breakpoints.down('sm')]: {
              flexDirection: 'column',
            },
          }}
          container
          spacing={isSmallBp ? 0 : 4}
        >
          <Grid sm={6} xs={12}>
            {jsxSelectVLAN}
          </Grid>
          <Grid sm={6} xs={12}>
            {jsxIPAMForVLAN}
          </Grid>
        </Grid>
      </Grid>
    ) : (
      <Grid sm={6} xs={12}>
        <Stack>
          {jsxSelectVLAN}
          {jsxIPAMForVLAN}
        </Stack>
      </Grid>
    );
  };

  const displayUnavailableInRegionTextVPC =
    purpose === 'vpc' && regionHasVPCs === false;
  const displayUnavailableInRegionTextVLAN =
    purpose === 'vlan' && regionHasVLANs === false;

  const unavailableInRegionHelperTextJSX =
    !displayUnavailableInRegionTextVPC &&
    !displayUnavailableInRegionTextVLAN ? null : (
      <Typography
        data-testid="unavailable-in-region-text"
        sx={{ marginTop: theme.spacing() }}
      >
        {displayUnavailableInRegionTextVPC ? 'VPC ' : 'VLAN '}{' '}
        {unavailableInRegionHelperTextSegment}
      </Typography>
    );

  return (
    <Grid container>
      {fromAddonsPanel ? null : (
        <Grid xs={isSmallBp ? 12 : 6}>
          <Select
            options={
              // Do not display "None" as an option for eth0 (must be Public Internet, VLAN, or VPC).
              slotNumber > 0
                ? purposeOptions
                : purposeOptions.filter(
                    (thisPurposeOption) => thisPurposeOption.value !== 'none'
                  )
            }
            value={purposeOptions.find(
              (thisOption) => thisOption.value === purpose
            )}
            disabled={readOnly}
            isClearable={false}
            label={`eth${slotNumber}`}
            onChange={handlePurposeChange}
          />
          {unavailableInRegionHelperTextJSX}
        </Grid>
      )}
      {purpose === 'vlan' &&
        regionHasVLANs !== false &&
        enclosingJSXForVLANFields(jsxSelectVLAN, jsxIPAMForVLAN)}
      {purpose === 'vpc' && regionHasVPCs !== false && (
        <Grid xs={isSmallBp ? 12 : 6}>
          <VPCPanel
            toggleAssignPublicIPv4Address={() =>
              setAutoAssignLinodeIPv4(
                (autoAssignLinodeIPv4) => !autoAssignLinodeIPv4
              )
            }
            toggleAutoassignIPv4WithinVPCEnabled={() =>
              setAutoAssignVPCIPv4((autoAssignVPCIPv4) => !autoAssignVPCIPv4)
            }
            assignPublicIPv4Address={autoAssignLinodeIPv4}
            autoassignIPv4WithinVPC={autoAssignVPCIPv4}
            from="linodeConfig"
            handleSelectVPC={handleVPCLabelChange}
            handleSubnetChange={handleSubnetChange}
            handleVPCIPv4Change={handleVPCIPv4Input}
            publicIPv4Error={errors.publicIPv4Error}
            region={region}
            selectedSubnetId={subnetId}
            selectedVPCId={vpcId}
            subnetError={errors.subnetError}
            vpcIPv4AddressOfLinode={vpcIPv4}
            vpcIPv4Error={errors.vpcIPv4Error}
            vpcIdError={errors.vpcError}
          />
        </Grid>
      )}

      {!fromAddonsPanel && (
        <Divider
          sx={{
            margin: `${theme.spacing(4.5)} ${theme.spacing()} ${theme.spacing(
              1.5
            )} `,
            width: `calc(100% - ${theme.spacing(2)})`,
          }}
        />
      )}
    </Grid>
  );
};

const getPurposeOptions = (showVPCs: boolean) => {
  const purposeOptions: Item<ExtendedPurpose>[] = [
    {
      label: 'Public Internet',
      value: 'public',
    },
    {
      label: 'VLAN',
      value: 'vlan',
    },
    {
      label: 'None',
      value: 'none',
    },
  ];

  if (showVPCs) {
    purposeOptions.splice(1, 0, {
      label: 'VPC',
      value: 'vpc',
    });
  }

  return purposeOptions;
};

const unavailableInRegionHelperTextSegment =
  "is not available in this Linode's region";
