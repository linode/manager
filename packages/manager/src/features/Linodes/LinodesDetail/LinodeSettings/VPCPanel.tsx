import { useAllVPCsQuery, useRegionsQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import {
  doesRegionSupportFeature,
  scrollErrorIntoView,
} from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { VPCPublicIPLabel } from 'src/features/VPCs/components/VPCPublicIPLabel';
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
} from 'src/features/VPCs/constants';
import { AssignIPRanges } from 'src/features/VPCs/VPCDetail/AssignIPRanges';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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
  vpcIdError?: string;
  vpcIPRangesError?: string;
  vpcIPv4AddressOfLinode: string | undefined;
  vpcIPv4Error?: string;
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

  const {
    data: vpcsData,
    error,
    isLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region },
  });

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
    return vpcs.map((vpc) => ({ label: vpc.label, value: vpc.id }));
  }, [vpcs]);

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
      data-testid="vpc-panel"
      sx={{
        padding: 0,
      }}
    >
      <Stack>
        <Autocomplete
          autoHighlight
          clearIcon={null}
          disabled={!regionSupportsVPCs}
          errorText={vpcIdError ?? vpcError}
          label={'VPC'}
          loading={isLoading}
          noOptionsText="No VPCs exist in this Linode's region."
          onChange={(_, selectedVPC) => {
            handleSelectVPC(selectedVPC?.value || -1);
          }}
          options={vpcDropdownOptions}
          placeholder={'Select a VPC'}
          textFieldProps={{
            tooltipText: REGION_CAVEAT_HELPER_TEXT,
          }}
          value={
            selectedVPCId && selectedVPCId !== -1
              ? (vpcDropdownOptions.find(
                  (option) => option.value === selectedVPCId
                ) ?? null)
              : defaultVPCValue
          }
        />
        {selectedVPCId !== -1 && regionSupportsVPCs && (
          <Stack data-testid="subnet-and-additional-options-section">
            <Autocomplete
              autoHighlight
              clearIcon={null}
              errorText={subnetError}
              label="Subnet"
              onChange={(_, selectedSubnet) => {
                handleSubnetChange(selectedSubnet?.value);
              }}
              options={subnetDropdownOptions}
              placeholder="Select Subnet"
              textFieldProps={{
                errorGroup: ERROR_GROUP_STRING,
              }}
              value={
                subnetDropdownOptions.find(
                  (option) => option.value === selectedSubnetId
                ) ?? null
              }
            />
            {selectedSubnetId && (
              <>
                <Box
                  alignItems="center"
                  display="flex"
                  flexDirection="row"
                  sx={(theme) => ({
                    marginLeft: '2px',
                    paddingTop: theme.spacing(),
                  })}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoassignIPv4WithinVPC}
                        onChange={toggleAutoassignIPv4WithinVPCEnabled}
                      />
                    }
                    data-testid="vpc-ipv4-checkbox"
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
                  alignItems="center"
                  display="flex"
                  sx={(theme) => ({
                    marginLeft: '2px',
                    marginTop: !autoassignIPv4WithinVPC ? theme.spacing() : 0,
                  })}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={assignPublicIPv4Address}
                        onChange={toggleAssignPublicIPv4Address}
                      />
                    }
                    label={<VPCPublicIPLabel />}
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
