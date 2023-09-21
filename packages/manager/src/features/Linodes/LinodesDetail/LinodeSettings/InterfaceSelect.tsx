import {
  InterfacePayload,
  InterfacePurpose,
} from '@linode/api-v4/lib/linodes/types';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import { Divider } from 'src/components/Divider';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { TextField } from 'src/components/TextField';
import { useVlansQuery } from 'src/queries/vlans';
import { useSubnetsQuery, useVPCsQuery } from 'src/queries/vpcs';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';

export interface Props {
  fromAddonsPanel?: boolean;
  handleChange: (updatedInterface: ExtendedInterface) => void;
  ipamAddress: null | string;
  ipamError?: string;
  label: null | string;
  labelError?: string;
  purpose: ExtendedPurpose;
  readOnly: boolean;
  region?: string;
  slotNumber: number;
  subnetId?: null | number;
  subnetLabel: null | string;
  vpcId?: null | number;
  vpcIpv4?: null | string;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = 'none' | InterfacePurpose;
export interface ExtendedInterface
  extends Partial<Omit<InterfacePayload, 'purpose'>> {
  purpose: ExtendedPurpose;
  subnetLabel?: null | string;
}

export const InterfaceSelect = (props: Props) => {
  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    fromAddonsPanel,
    handleChange,
    ipamAddress,
    ipamError,
    label,
    labelError,
    purpose,
    readOnly,
    region,
    slotNumber,
    subnetId,
    subnetLabel,
    vpcId,
    vpcIpv4,
  } = props;

  const [newVlan, setNewVlan] = React.useState('');

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
      label: 'VPC',
      value: 'vpc',
    },
    {
      label: 'None',
      value: 'none',
    },
  ];

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

  const { data: vpcs, isLoading: vpcsLoading } = useVPCsQuery({}, {});
  const vpcOptions = vpcs?.data.map((vpc) => ({
    id: vpc.id,
    label: vpc.label,
    value: vpc.label,
  }));

  const { data: subnets, isLoading: subnetsLoading } = useSubnetsQuery(
    vpcId ?? -1,
    {},
    {},
    Boolean(vpcId)
  );
  const subnetOptions = subnets?.data.map((subnet) => ({
    label: subnet.label,
    subnet_id: subnet.id,
    value: subnet.label,
  }));

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

  const handleVPCLabelChange = (selected: Item<string>) =>
    handleChange({
      ipam_address: null,
      label: selected?.value ?? '',
      purpose,
      subnet_id: null,
      vpc_id: selected?.id,
    });

  const handleSubnetChange = (selected: Item<string>) =>
    handleChange({
      ipam_address: null,
      label,
      purpose,
      subnet_id: selected?.subnet_id,
      subnetLabel: selected?.value,
      vpc_id: vpcId,
    });

  const handleVpcIpv4Input = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({
      ipam_address: null,
      ipv4: {
        nat_1_1: autoAssignLinodeIpv4 ? 'any' : '',
        vpc: e.target.value,
      },
      label,
      purpose,
      subnet_id: subnetId,
      subnetLabel,
      vpc_id: vpcId,
    });

  React.useEffect(() => {
    const changeObj = {
      ipam_address: null,
      label,
      purpose,
      subnet_id: subnetId,
      subnetLabel,
      vpc_id: vpcId,
    };
    console.log(
      `autoAssignVpcIpv4: ${autoAssignVpcIpv4}, autoAssignLinodeIpv4: ${autoAssignLinodeIpv4}`
    );
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
        <Grid xs={12}>
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
                errorText={labelError}
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
                errorText={ipamError}
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
      {purpose === 'vpc' ? (
        <Grid container>
          <Grid container flexDirection="column" spacing={isSmallBp ? 0 : 1}>
            <Grid>
              <Select
                noOptionsMessage={() =>
                  vpcsLoading ? 'Loading...' : 'You have no VPCs.'
                }
                creatable
                createOptionPosition="first"
                errorText={labelError}
                inputId={`vpc-label-${slotNumber}`}
                isClearable
                isDisabled={readOnly}
                label="VPC"
                onChange={handleVPCLabelChange}
                options={vpcOptions}
                placeholder="Select a VPC"
                value={vpcOptions?.find((vpc) => vpc.value === label) ?? null}
              />
            </Grid>
            <Grid sx={{ paddingBottom: 2 }}>
              <Select
                noOptionsMessage={() =>
                  subnetsLoading ? 'Loading...' : 'You have no Subnets.'
                }
                value={
                  subnetOptions?.find(
                    (subnet) => subnet.value === subnetLabel
                  ) ?? null
                }
                creatable
                createOptionPosition="first"
                errorText={labelError}
                inputId={`subnet-label-${slotNumber}`}
                isClearable
                isDisabled={readOnly}
                label="Subnets"
                onChange={handleSubnetChange}
                options={subnetOptions}
                placeholder="Select a Subnet"
              />
            </Grid>
            <Grid>
              <Checkbox
                onChange={() =>
                  setAutoAssignVpcIpv4(
                    (autoAssignVpcIpv4) => !autoAssignVpcIpv4
                  )
                }
                checked={autoAssignVpcIpv4}
                text="Auto-assign a VPC IPv4 address for this Linode"
                toolTipText="A range of non-internet facing IP addresses used in an internal network."
              />
            </Grid>
            {!autoAssignVpcIpv4 && (
              <Grid>
                <TextField
                  label="VPC IPv4"
                  onChange={handleVpcIpv4Input}
                  value={vpcIpv4}
                />
              </Grid>
            )}
            <Grid>
              <Checkbox
                onChange={() =>
                  setAutoAssignLinodeIpv4(
                    (autoAssignLinodeIpv4) => !autoAssignLinodeIpv4
                  )
                }
                checked={autoAssignLinodeIpv4}
                text="Assign a public IPv4 address for this Linode"
                toolTipText="Assign a public IP address for this VPC via 1:1 static NAT."
              />
            </Grid>
          </Grid>
        </Grid>
      ) : null}

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
