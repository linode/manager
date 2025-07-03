import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Notice,
  Paper,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

import { Code } from 'src/components/Code/Code';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { NODEBALANCER_REGION_CAVEAT_HELPER_TEXT } from '../VPCs/constants';

import type { APIError, NodeBalancerVpcPayload, VPC } from '@linode/api-v4';

export interface Props {
  disabled?: boolean;
  errors?: APIError[];
  ipv4Change: (ipv4Range: null | string, index: number) => void;
  regionSelected: string;
  setVpcSelected: (vpc: null | VPC) => void;
  subnetChange: (subnetIds: null | number[]) => void;
  subnetsSelected?: NodeBalancerVpcPayload[];
  vpcSelected: null | VPC;
}

export const VPCPanel = (props: Props) => {
  const {
    disabled,
    errors,
    ipv4Change,
    regionSelected,
    setVpcSelected,
    subnetsSelected,
    subnetChange,
    vpcSelected,
  } = props;

  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: region } = useRegionQuery(regionSelected);

  const regionSupportsVPC = region?.capabilities.includes('VPCs') || false;
  const vpcSelectDisabled = !!regionSelected && !regionSupportsVPC;

  const {
    data: vpcs,
    error: error,
    isLoading: isVPCLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPC,
    filter: { region: regionSelected },
  });

  const [autoAssignIPv4WithinVPC, toggleAutoAssignIPv4Range] =
    React.useState<boolean>(true);

  const getVPCSubnetLabelFromId = (subnetId: number): string => {
    const subnet = vpcSelected?.subnets.find(({ id }) => id === subnetId);
    return subnet?.label || '';
  };

  const vpcError = error
    ? getAPIErrorOrDefault(error, 'Unable to load VPCs')[0].reason
    : undefined;

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">VPC</Typography>
        <Stack spacing={1.5}>
          <Typography>
            Complete this section to allow this NodeBalancer to communicate with
            backend nodes in a VPC.
          </Typography>
          <Autocomplete
            data-testid="vpc-select"
            disabled={disabled || vpcSelectDisabled}
            errorText={vpcError}
            helperText={
              regionSelected && !regionSupportsVPC
                ? 'VPC is not available in the selected region.'
                : undefined
            }
            label="VPC"
            loading={isVPCLoading}
            noMarginTop
            noOptionsText={
              !regionSelected
                ? 'Select a region to see available VPCs.'
                : 'There are no VPCs in the selected region.'
            }
            onChange={(e, vpc) => {
              setVpcSelected(vpc ?? null);

              if (vpc && vpc.subnets.length === 1) {
                // If the user selects a VPC and the VPC only has one subnet,
                // preselect that subnet for the user.
                subnetChange([vpc.subnets[0].id]);
              } else {
                // Otherwise, just clear the selected subnet
                subnetChange(null);
              }
            }}
            options={vpcs ?? []}
            placeholder="None"
            textFieldProps={{
              tooltipText: NODEBALANCER_REGION_CAVEAT_HELPER_TEXT,
              tooltipPosition: 'right',
            }}
            value={vpcSelected ?? null}
          />
          {vpcSelected && (
            <Stack>
              <Notice
                spacingBottom={16}
                spacingTop={8}
                text={"The VPC can't be changed after NodeBalancer creation."}
                variant="warning"
              />
              <Autocomplete
                errorText={
                  errors?.find((err) => err.field?.includes('subnet_id'))
                    ?.reason
                }
                getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
                label="Subnet"
                noMarginTop
                onChange={(_, subnet) =>
                  subnetChange(subnet ? [subnet.id] : null)
                }
                options={vpcSelected?.subnets ?? []}
                placeholder="Subnet"
                textFieldProps={{
                  helperText: (
                    <Box component="span" mb={2} sx={{ display: 'block' }}>
                      <Typography component="span" variant="body1">
                        Select a subnet in which to allocate the VPC CIDR for
                        the NodeBalancer.
                      </Typography>
                    </Box>
                  ),
                  helperTextPosition: 'top',
                }}
                value={
                  vpcSelected?.subnets.find(
                    (subnet) => subnet.id === subnetsSelected?.[0].subnet_id
                  ) ?? null
                }
              />
              {subnetsSelected && (
                <>
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="row"
                    sx={(theme) => ({
                      marginLeft: theme.spacingFunction(4),
                      paddingTop: theme.spacingFunction(8),
                    })}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={autoAssignIPv4WithinVPC}
                          onChange={(_, checked) => {
                            if (checked) {
                              ipv4Change(null, 0);
                            } else {
                              ipv4Change('', 0);
                            }
                            toggleAutoAssignIPv4Range(checked);
                          }}
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
                            Auto-assign IPs for this NodeBalancer
                          </Typography>
                          <TooltipIcon
                            status="info"
                            text={
                              <Typography
                                component={'span'}
                                sx={{ whiteSpace: 'pre-line' }}
                              >
                                When enabled, the system automatically allocates
                                a <Code>/30</Code> CIDR from the specified
                                Subnet for the NodeBalancer&apos;s backend nodes
                                in the VPC.
                                <br />
                                <br /> Disable this option to assign a{' '}
                                <Code>/30</Code> IPv4 CIDR subnet range for this
                                NodeBalancer.
                              </Typography>
                            }
                            tooltipPosition="right"
                          />
                        </Box>
                      }
                    />
                  </Box>
                  {!autoAssignIPv4WithinVPC &&
                    subnetsSelected.map((vpc, index) => (
                      <TextField
                        errorText={
                          errors?.find((err) =>
                            err.field?.includes(`vpcs[${index}].ipv4_range`)
                          )?.reason
                        }
                        key={`${vpc.subnet_id}`}
                        label={`NodeBalancer IPv4 CIDR for ${getVPCSubnetLabelFromId(vpc.subnet_id)}`}
                        noMarginTop
                        onChange={(e) =>
                          ipv4Change(e.target.value ?? '', index)
                        }
                        required
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                /30
                              </InputAdornment>
                            ),
                          },
                        }}
                        value={vpc.ipv4_range}
                      />
                    ))}
                </>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
