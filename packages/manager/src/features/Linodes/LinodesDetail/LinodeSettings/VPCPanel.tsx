import {
  Box,
  Checkbox,
  Paper,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { FormControlLabel } from 'src/components/FormControlLabel';
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
} from 'src/features/VPCs/constants';
import { AssignIPRanges } from 'src/features/VPCs/VPCDetail/AssignIPRanges';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useAllVPCsQuery } from 'src/queries/vpcs/vpcs';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface VPCPanelProps {
  additionalIPv4RangesForVPC: ExtendedIP[];
  assignPublicIPv4Address: boolean;
  autoassignIPv4WithinVPC: boolean;
  handleIPv4RangeChange: (ranges: ExtendedIP[]) => void;
  handleSelectVPC: (vpcId: number) => void;
  handleSubnetChange: (subnetId: number | undefined) => void;
  handleVPCIPv4Change: (IPv4: string) => void;
  publicIPv4Error?: string;
  region: string | undefined;
  selectedSubnetId: null | number | undefined;
  selectedVPCId: null | number | undefined;
  subnetError?: string;
  toggleAssignPublicIPv4Address: () => void;
  toggleAutoassignIPv4WithinVPCEnabled: () => void;
  vpcIPRangesError?: string;
  vpcIPv4AddressOfLinode: string | undefined;
  vpcIPv4Error?: string;
  vpcIdError?: string;
}

const ERROR_GROUP_STRING = 'vpc-errors';

export const VPCPanel = (props: VPCPanelProps) => {
  const {
    additionalIPv4RangesForVPC,
    assignPublicIPv4Address,
    autoassignIPv4WithinVPC,
    handleIPv4RangeChange,
    handleSelectVPC,
    handleSubnetChange,
    handleVPCIPv4Change,
    publicIPv4Error,
    region,
    selectedSubnetId,
    selectedVPCId,
    subnetError,
    toggleAssignPublicIPv4Address,
    toggleAutoassignIPv4WithinVPCEnabled,
    vpcIPRangesError,
    vpcIPv4AddressOfLinode,
    vpcIPv4Error,
    vpcIdError,
  } = props;

  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));

  const regions = useRegionsQuery().data ?? [];
  const selectedRegion = region || '';

  const regionSupportsVPCs = doesRegionSupportFeature(
    selectedRegion,
    regions,
    'VPCs'
  );

  const { data: vpcsData, error, isLoading } = useAllVPCsQuery();

  React.useEffect(() => {
    if (subnetError || vpcIPv4Error) {
      scrollErrorIntoView(ERROR_GROUP_STRING);
    }
  }, [subnetError, vpcIPv4Error]);

  const vpcs = vpcsData ?? [];

  interface DropdownOption {
    label: string;
    value: number;
  }

  const vpcDropdownOptions: DropdownOption[] = React.useMemo(() => {
    return vpcs.reduce((accumulator, vpc) => {
      return vpc.region === region
        ? [...accumulator, { label: vpc.label, value: vpc.id }]
        : accumulator;
    }, []);
  }, [vpcs, region]);

  const defaultVPCValue = null;

  const subnetDropdownOptions: DropdownOption[] =
    vpcs
      .find((vpc) => vpc.id === selectedVPCId)
      ?.subnets.map((subnet) => ({
        label: `${subnet.label} (${subnet.ipv4 ?? 'No IPv4 range provided'})`, // @TODO VPC: Support for IPv6 down the line
        value: subnet.id,
      })) ?? [];

  const vpcError = error
    ? getAPIErrorOrDefault(error, 'Unable to load VPCs')[0].reason
    : undefined;

  return (
    <Paper
      sx={{
        padding: 0,
      }}
      data-testid="vpc-panel"
    >
      <Stack>
        <Autocomplete
          onChange={(_, selectedVPC) => {
            handleSelectVPC(selectedVPC?.value || -1);
          }}
          textFieldProps={{
            tooltipText: REGION_CAVEAT_HELPER_TEXT,
          }}
          value={
            selectedVPCId && selectedVPCId !== -1
              ? vpcDropdownOptions.find(
                  (option) => option.value === selectedVPCId
                ) ?? null
              : defaultVPCValue
          }
          autoHighlight
          clearIcon={null}
          disabled={!regionSupportsVPCs}
          errorText={vpcIdError ?? vpcError}
          label={'VPC'}
          loading={isLoading}
          noOptionsText="No VPCs exist in this Linode's region."
          options={vpcDropdownOptions}
          placeholder={'Select a VPC'}
        />
        {selectedVPCId !== -1 && regionSupportsVPCs && (
          <Stack data-testid="subnet-and-additional-options-section">
            <Autocomplete
              onChange={(_, selectedSubnet) => {
                handleSubnetChange(selectedSubnet?.value);
              }}
              textFieldProps={{
                errorGroup: ERROR_GROUP_STRING,
              }}
              value={
                subnetDropdownOptions.find(
                  (option) => option.value === selectedSubnetId
                ) ?? null
              }
              autoHighlight
              clearIcon={null}
              errorText={subnetError}
              label="Subnet"
              options={subnetDropdownOptions}
              placeholder="Select Subnet"
            />
            {selectedSubnetId && (
              <>
                <Box
                  sx={(theme) => ({
                    marginLeft: '2px',
                    paddingTop: theme.spacing(),
                  })}
                  alignItems="center"
                  display="flex"
                  flexDirection="row"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoassignIPv4WithinVPC}
                        onChange={toggleAutoassignIPv4WithinVPCEnabled}
                      />
                    }
                    label={
                      <Box
                        alignItems="center"
                        display="flex"
                        flexDirection="row"
                      >
                        <Typography noWrap={!isSmallBp}>
                          Auto-assign a VPC IPv4 address for this Linode in the
                          VPC
                        </Typography>
                        <TooltipIcon
                          status="help"
                          text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP}
                        />
                      </Box>
                    }
                    data-testid="vpc-ipv4-checkbox"
                  />
                </Box>
                {!autoassignIPv4WithinVPC && (
                  <TextField
                    errorGroup={ERROR_GROUP_STRING}
                    errorText={vpcIPv4Error}
                    label="VPC IPv4"
                    onChange={(e) => handleVPCIPv4Change(e.target.value)}
                    required={!autoassignIPv4WithinVPC}
                    value={vpcIPv4AddressOfLinode}
                  />
                )}
                <Box
                  sx={(theme) => ({
                    marginLeft: '2px',
                    marginTop: !autoassignIPv4WithinVPC ? theme.spacing() : 0,
                  })}
                  alignItems="center"
                  display="flex"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={assignPublicIPv4Address}
                        onChange={toggleAssignPublicIPv4Address}
                      />
                    }
                    label={
                      <Box
                        alignItems="center"
                        display="flex"
                        flexDirection="row"
                      >
                        <Typography>
                          Assign a public IPv4 address for this Linode
                        </Typography>
                        <TooltipIcon
                          text={
                            'Access the internet through the public IPv4 address using static 1:1 NAT.'
                          }
                          status="help"
                        />
                      </Box>
                    }
                  />
                </Box>
                {assignPublicIPv4Address && publicIPv4Error && (
                  <Typography
                    sx={(theme) => ({
                      color: theme.color.red,
                    })}
                  >
                    {publicIPv4Error}
                  </Typography>
                )}
                <AssignIPRanges
                  handleIPRangeChange={handleIPv4RangeChange}
                  includeDescriptionInTooltip
                  ipRanges={additionalIPv4RangesForVPC}
                  ipRangesError={vpcIPRangesError}
                />
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
