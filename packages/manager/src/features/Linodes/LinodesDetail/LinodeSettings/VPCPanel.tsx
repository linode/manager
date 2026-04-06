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

import { PublicAccess } from 'src/features/VPCs/components/PublicAccess';
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
  VPC_AUTO_ASSIGN_IPV6_TOOLTIP,
} from 'src/features/VPCs/constants';
import { AssignIPRanges } from 'src/features/VPCs/VPCDetail/AssignIPRanges';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface VPCPanelProps {
  additionalIPv4RangesForVPC: ExtendedIP[];
  additionalIPv6RangesForVPC: ExtendedIP[];
  assignPublicIPv4Address: boolean;
  assignPublicIPv6Address: boolean;
  autoassignIPv4WithinVPC: boolean;
  autoassignIPv6WithinVPC: boolean;
  handleIPv4RangeChange: (ranges: ExtendedIP[]) => void;
  handleIPv6RangeChange: (ranges: ExtendedIP[]) => void;
  handleSelectVPC: (vpcId: number) => void;
  handleSubnetChange: (subnetId: number | undefined) => void;
  handleVPCIPv4Change: (IPv4: string) => void;
  handleVPCIPv6Change: (IPv6: string) => void;
  publicIPv4Error?: string;
  publicIPv6Error?: string;
  region: string | undefined;
  selectedSubnetId: null | number | undefined;
  selectedVPCId: null | number | undefined;
  showIPv6Content: boolean;
  subnetError?: string;
  toggleAssignPublicIPv4Address: (ipv4Access: null | string) => void;
  toggleAssignPublicIPv6Address: () => void;
  toggleAutoassignIPv4WithinVPCEnabled: () => void;
  toggleAutoassignIPv6WithinVPCEnabled: () => void;
  vpcIdError?: string;
  vpcIPRangesError?: string;
  vpcIPv4AddressOfLinode: string | undefined;
  vpcIPv4Error?: string;
  vpcIPv6AddressOfLinode: string | undefined;
  vpcIPv6Error?: string;
}

const ERROR_GROUP_STRING = 'vpc-errors';

export const VPCPanel = (props: VPCPanelProps) => {
  const {
    additionalIPv4RangesForVPC,
    additionalIPv6RangesForVPC,
    assignPublicIPv4Address,
    assignPublicIPv6Address,
    autoassignIPv4WithinVPC,
    autoassignIPv6WithinVPC,
    handleIPv4RangeChange,
    handleIPv6RangeChange,
    handleSelectVPC,
    handleSubnetChange,
    handleVPCIPv4Change,
    handleVPCIPv6Change,
    publicIPv4Error,
    publicIPv6Error,
    region,
    selectedSubnetId,
    selectedVPCId,
    showIPv6Content,
    subnetError,
    toggleAssignPublicIPv4Address,
    toggleAssignPublicIPv6Address,
    toggleAutoassignIPv4WithinVPCEnabled,
    toggleAutoassignIPv6WithinVPCEnabled,
    vpcIPRangesError,
    vpcIPv4AddressOfLinode,
    vpcIPv4Error,
    vpcIdError,
    vpcIPv6AddressOfLinode,
    vpcIPv6Error,
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
    if (subnetError || vpcIPv4Error || vpcIPv6Error) {
      scrollErrorIntoView(ERROR_GROUP_STRING);
    }
  }, [subnetError, vpcIPv4Error, vpcIPv6Error]);

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
                          Auto-assign VPC IPv4 address
                        </Typography>
                        <TooltipIcon
                          status="info"
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
                    noMarginTop={showIPv6Content}
                    onChange={(e) => handleVPCIPv4Change(e.target.value)}
                    required={!autoassignIPv4WithinVPC}
                    value={vpcIPv4AddressOfLinode}
                  />
                )}
                {showIPv6Content && (
                  <>
                    <Box
                      alignItems="center"
                      display="flex"
                      flexDirection="row"
                      sx={(theme) => ({
                        marginLeft: '2px',
                        paddingTop: theme.spacingFunction(8),
                      })}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={autoassignIPv6WithinVPC}
                            onChange={toggleAutoassignIPv6WithinVPCEnabled}
                          />
                        }
                        data-testid="vpc-ipv6-checkbox"
                        label={
                          <Box
                            alignItems="center"
                            display="flex"
                            flexDirection="row"
                          >
                            <Typography noWrap={!isSmallBp}>
                              Auto-assign VPC IPv6 address
                            </Typography>
                            <TooltipIcon
                              status="info"
                              text={VPC_AUTO_ASSIGN_IPV6_TOOLTIP}
                            />
                          </Box>
                        }
                      />
                    </Box>
                    {!autoassignIPv6WithinVPC && (
                      <TextField
                        errorGroup={ERROR_GROUP_STRING}
                        errorText={vpcIPv6Error}
                        label="VPC IPv6"
                        noMarginTop
                        onChange={(e) => handleVPCIPv6Change(e.target.value)}
                        value={vpcIPv6AddressOfLinode}
                      />
                    )}
                  </>
                )}
                <PublicAccess
                  allowPublicIPv4Access={assignPublicIPv4Address}
                  allowPublicIPv6Access={assignPublicIPv6Address}
                  handleAllowPublicIPv4AccessChange={
                    toggleAssignPublicIPv4Address as unknown as (
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => void // The type conversion is not ideal, but seems to be the least disruptive option
                  }
                  handleAllowPublicIPv6AccessChange={
                    toggleAssignPublicIPv6Address
                  }
                  publicIPv4Error={publicIPv4Error}
                  publicIPv6Error={publicIPv6Error}
                  showIPv6Content={showIPv6Content}
                  sx={{ margin: `${theme.spacingFunction(16)} 0` }}
                  userCannotAssignLinodes={false}
                />
                <AssignIPRanges
                  handleIPRangeChange={handleIPv4RangeChange}
                  handleIPv6RangeChange={handleIPv6RangeChange}
                  includeDescriptionInTooltip
                  ipRangesError={vpcIPRangesError}
                  ipv4Ranges={additionalIPv4RangesForVPC}
                  ipv6Ranges={additionalIPv6RangesForVPC}
                  showIPv6Fields={showIPv6Content}
                />
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
