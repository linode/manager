import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { VPCPanel } from 'src/features/Linodes/LinodesCreate/VPCPanel';
import { useVlansQuery } from 'src/queries/vlans';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics/customEventAnalytics';

import type {
  InterfacePayload,
  InterfacePurpose,
} from '@linode/api-v4/lib/linodes/types';
import type { Item } from 'src/components/EnhancedSelect/Select';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface InterfaceErrors extends VPCInterfaceErrors, OtherInterfaceErrors {}

interface InterfaceSelectProps extends VPCState {
  additionalIPv4RangesForVPC?: ExtendedIP[];
  errors: InterfaceErrors;
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
  ipRangeError?: string;
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

export const InterfaceSelect = (props: InterfaceSelectProps) => {
  const {
    additionalIPv4RangesForVPC,
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

  const [newVlan, setNewVlan] = React.useState('');

  const purposeOptions: Item<ExtendedPurpose>[] = [
    {
      label: 'Public Internet',
      value: 'public',
    },
    {
      label: 'VPC',
      value: 'vpc',
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

  const _additionalIPv4RangesForVPC = additionalIPv4RangesForVPC?.map(
    (ip_range) => ip_range.address
  );

  const handlePurposeChange = (selectedValue: ExtendedPurpose) => {
    const purpose = selectedValue;
    handleChange({
      ipam_address: purpose === 'vlan' ? ipamAddress : '',
      label: purpose === 'vlan' ? label : '',
      purpose,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ ipam_address: e.target.value, label, purpose });

  const handleLabelChange = (selectedValue: string) =>
    handleChange({
      ipam_address: ipamAddress,
      label: selectedValue,
      purpose,
    });

  const handleVPCLabelChange = (selectedVPCId: number) => {
    // Only clear VPC related fields if VPC selection changes
    if (selectedVPCId !== vpcId) {
      handleChange({
        ip_ranges: _additionalIPv4RangesForVPC,
        ipv4: {
          nat_1_1: nattedIPv4Address,
          vpc: vpcIPv4,
        },
        purpose,
        vpc_id: selectedVPCId,
      });
    }
  };

  const handleIPv4RangeChange = (ipv4Ranges: ExtendedIP[]) => {
    handleChange({
      ip_ranges: ipv4Ranges.map((ip_range) => ip_range.address),
      ipv4: {
        nat_1_1: nattedIPv4Address,
        vpc: vpcIPv4,
      },
      purpose,
      subnet_id: subnetId,
      vpc_id: vpcId,
    });
  };

  const handleSubnetChange = (selectedSubnetId: number) =>
    handleChange({
      ip_ranges: _additionalIPv4RangesForVPC,
      ipv4: {
        nat_1_1: nattedIPv4Address,
        vpc: vpcIPv4,
      },
      purpose,
      subnet_id: selectedSubnetId,
      vpc_id: vpcId,
    });

  const handleVPCIPv4Input = (vpcIPv4Input: string | undefined) =>
    handleChange({
      ip_ranges: _additionalIPv4RangesForVPC,
      ipv4: {
        nat_1_1: nattedIPv4Address,
        vpc: vpcIPv4Input,
      },
      purpose,
      subnet_id: subnetId,
      vpc_id: vpcId,
    });

  const handleIPv4Input = (IPv4Input: string | undefined) =>
    handleChange({
      ip_ranges: _additionalIPv4RangesForVPC,
      ipv4: {
        nat_1_1: IPv4Input,
        vpc: vpcIPv4,
      },
      purpose,
      subnet_id: subnetId,
      vpc_id: vpcId,
    });

  const handleCreateOption = (_newVlan: string) => {
    setNewVlan(_newVlan);
    handleChange({
      ipam_address: ipamAddress,
      label: _newVlan,
      purpose,
    });
  };

  const filterVLANOptions = (
    options: { label: string; value: string }[],
    { inputValue }: { inputValue: string }
  ) => {
    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    const isExistingVLAN = options.some(
      (o) => o.label.toLowerCase() === inputValue.toLowerCase()
    );

    if (inputValue !== '' && !isExistingVLAN) {
      filtered.push({
        label: `Create "${inputValue}"`,
        value: inputValue,
      });
    }

    return filtered;
  };
  const jsxSelectVLAN = (
    <Autocomplete
      noOptionsText={
        isLoading
          ? 'Loading...'
          : 'You have no VLANs in this region. Type to create one.'
      }
      onChange={(_, selected, reason, details) => {
        const detailsOption = details?.option;
        if (
          reason === 'selectOption' &&
          detailsOption?.label.includes(`Create "${detailsOption?.value}"`)
        ) {
          handleCreateOption(detailsOption.value);
        } else {
          handleLabelChange(selected?.value ?? '');
        }
      }}
      autoHighlight
      disabled={readOnly}
      errorText={errors.labelError}
      filterOptions={filterVLANOptions}
      id={`vlan-label-${slotNumber}`}
      label="VLAN"
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
        <>
          <Grid width={'100%'}>
            {errors.primaryError && (
              <Notice text={errors.primaryError} variant="error" />
            )}
          </Grid>
          <Grid xs={isSmallBp ? 12 : 6}>
            <Autocomplete
              options={
                // Do not display "None" as an option for eth0 (must be Public Internet, VLAN, or VPC).
                slotNumber > 0
                  ? purposeOptions
                  : purposeOptions.filter(
                      (thisPurposeOption) => thisPurposeOption.value !== 'none'
                    )
              }
              textFieldProps={{
                disabled: readOnly,
              }}
              value={purposeOptions.find(
                (thisOption) => thisOption.value === purpose
              )}
              autoHighlight
              disableClearable
              label={`eth${slotNumber}`}
              onChange={(_, selected) => handlePurposeChange(selected?.value)}
              placeholder="Select an Interface"
            />
            {unavailableInRegionHelperTextJSX}
          </Grid>
        </>
      )}
      {purpose === 'vlan' &&
        regionHasVLANs !== false &&
        enclosingJSXForVLANFields(jsxSelectVLAN, jsxIPAMForVLAN)}
      {purpose === 'vpc' && regionHasVPCs !== false && (
        <Grid xs={isSmallBp ? 12 : 6}>
          <VPCPanel
            toggleAssignPublicIPv4Address={() =>
              handleIPv4Input(
                nattedIPv4Address === undefined ? 'any' : undefined
              )
            }
            toggleAutoassignIPv4WithinVPCEnabled={() =>
              handleVPCIPv4Input(vpcIPv4 === undefined ? '' : undefined)
            }
            additionalIPv4RangesForVPC={additionalIPv4RangesForVPC ?? []}
            assignPublicIPv4Address={nattedIPv4Address !== undefined}
            autoassignIPv4WithinVPC={vpcIPv4 === undefined}
            from="linodeConfig"
            handleIPv4RangeChange={handleIPv4RangeChange}
            handleSelectVPC={handleVPCLabelChange}
            handleSubnetChange={handleSubnetChange}
            handleVPCIPv4Change={handleVPCIPv4Input}
            publicIPv4Error={errors.publicIPv4Error}
            region={region}
            selectedSubnetId={subnetId}
            selectedVPCId={vpcId}
            subnetError={errors.subnetError}
            vpcIPRangesError={errors.ipRangeError}
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

const unavailableInRegionHelperTextSegment =
  "is not available in this Linode's region";
