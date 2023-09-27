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
import { TextField } from 'src/components/TextField';
import { VPCPanel } from 'src/features/Linodes/LinodesCreate/VPCPanel';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { useVlansQuery } from 'src/queries/vlans';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';

export interface Props {
  fromAddonsPanel?: boolean;
  handleChange: (updatedInterface: ExtendedInterface) => void;
  ipamAddress?: null | string;
  label?: null | string;
  purpose: ExtendedPurpose;
  readOnly: boolean;
  region?: string;
  slotNumber: number;
}

interface VpcStateErrors {
  ipamError?: string;
  labelError?: string;
  nat_1_1Error?: string;
  subnetError?: string;
  vpcError?: string;
  vpcIpv4Error?: string;
}

interface VpcState {
  errors: VpcStateErrors;
  subnetId?: number;
  vpcId?: number;
  vpcIpv4?: string;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = 'none' | InterfacePurpose;
export interface ExtendedInterface
  extends Partial<Omit<InterfacePayload, 'purpose'>> {
  purpose: ExtendedPurpose;
}

type CombinedProps = Props & VpcState;

export const InterfaceSelect = (props: CombinedProps) => {
  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));
  const flags = useFlags();
  const { data: account } = useAccount();

  const showVPCs = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  const {
    errors,
    fromAddonsPanel,
    handleChange,
    ipamAddress,
    label,
    purpose,
    readOnly,
    region,
    slotNumber,
    subnetId,
    vpcId,
    vpcIpv4,
  } = props;

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

  const [autoAssignVpcIpv4, setAutoAssignVpcIpv4] = React.useState(true);
  const [autoAssignLinodeIpv4, setAutoAssignLinodeIpv4] = React.useState(false);

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

  const handleVPCLabelChange = (selectedVpcId: number) =>
    handleChange({
      ipam_address: null,
      ipv4: {
        vpc: autoAssignVpcIpv4 ? undefined : vpcIpv4,
      },
      label: null,
      purpose,
      subnet_id: undefined,
      vpc_id: selectedVpcId,
    });

  const handleSubnetChange = (selectedSubnetId: number) =>
    handleChange({
      ipam_address: null,
      ipv4: {
        vpc: autoAssignVpcIpv4 ? undefined : vpcIpv4,
      },
      label: null,
      purpose,
      subnet_id: selectedSubnetId,
      vpc_id: vpcId,
    });

  const handleVpcIpv4Input = (vpcIpv4Input: string) => {
    const changeObj = {
      ipam_address: null,
      label: null,
      purpose,
      subnet_id: subnetId,
      vpc_id: vpcId,
    };
    if (autoAssignLinodeIpv4) {
      handleChange({
        ...changeObj,
        ipv4: {
          nat_1_1: 'any',
          vpc: vpcIpv4Input,
        },
      });
    } else {
      handleChange({
        ...changeObj,
        ipv4: {
          vpc: vpcIpv4Input,
        },
      });
    }
  };

  React.useEffect(() => {
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
    if (!autoAssignVpcIpv4 && autoAssignLinodeIpv4) {
      handleChange({
        ...changeObj,
        ipv4: {
          nat_1_1: 'any',
          vpc: vpcIpv4,
        },
      });
    } else if (
      (autoAssignVpcIpv4 && autoAssignLinodeIpv4) ||
      autoAssignLinodeIpv4
    ) {
      handleChange({
        ...changeObj,
        ipv4: {
          nat_1_1: 'any',
        },
      });
    } else if (autoAssignVpcIpv4 && !autoAssignLinodeIpv4) {
      handleChange({
        ...changeObj,
      });
    } else if (!autoAssignLinodeIpv4 && !autoAssignVpcIpv4) {
      handleChange({
        ...changeObj,
        ipv4: {
          vpc: vpcIpv4,
        },
      });
    }
  }, [autoAssignVpcIpv4, autoAssignLinodeIpv4]);

  const handleCreateOption = (_newVlan: string) => {
    setNewVlan(_newVlan);
    handleChange({
      ipam_address: ipamAddress,
      label: _newVlan,
      purpose,
    });
  };

  return (
    <Grid container>
      {fromAddonsPanel ? null : (
        <Grid xs={purpose === 'vpc' && !isSmallBp ? 6 : 12}>
          <Select
            options={
              // Do not display "None" as an option for eth0 (must be either Public Internet or a VLAN).
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
        </Grid>
      )}
      {purpose === 'vlan' ? (
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
              <Select
                noOptionsMessage={() =>
                  isLoading
                    ? 'Loading...'
                    : 'You have no VLANs in this region. Type to create one.'
                }
                value={
                  vlanOptions.find((thisVlan) => thisVlan.value === label) ??
                  null
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
              />
            </Grid>
            <Grid sm={6} xs={12}>
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
            </Grid>
          </Grid>
        </Grid>
      ) : null}
      {purpose === 'vpc' && (
        <Grid xs={isSmallBp ? 12 : 6}>
          <VPCPanel
            toggleAssignPublicIPv4Address={() =>
              setAutoAssignLinodeIpv4(
                (autoAssignLinodeIpv4) => !autoAssignLinodeIpv4
              )
            }
            toggleAutoassignIPv4WithinVPCEnabled={() =>
              setAutoAssignVpcIpv4((autoAssignVpcIpv4) => !autoAssignVpcIpv4)
            }
            assignPublicIPv4Address={autoAssignLinodeIpv4}
            autoassignIPv4WithinVPC={autoAssignVpcIpv4}
            from="linodeConfig"
            handleSelectVPC={handleVPCLabelChange}
            handleSubnetChange={handleSubnetChange}
            handleVPCIPv4Change={handleVpcIpv4Input}
            nat_1_1Error={errors.nat_1_1Error}
            region={region}
            selectedSubnetId={subnetId}
            selectedVPCId={vpcId}
            subnetError={errors.subnetError}
            vpcIPv4AddressOfLinode={vpcIpv4}
            vpcIPv4Error={errors.vpcIpv4Error}
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
