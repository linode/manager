import { useAllVPCsQuery } from '@linode/queries';
import {
  Autocomplete,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';

import { NODEBALANCER_REGION_CAVEAT_HELPER_TEXT } from '../VPCs/constants';

import type {
  APIError,
  NodeBalancerVpcPayload,
  Region,
  VPC,
} from '@linode/api-v4';

export interface Props {
  disabled?: boolean;
  errors: APIError[];
  ipv4Change: (ipv4Range: string, index: number) => void;
  regionSelected: null | Region;
  subnetChange: (subnetIds: null | number[]) => void;
  subnets?: NodeBalancerVpcPayload[];
  vpcChange: (vpc: null | VPC) => void;
  vpcSelected: null | VPC;
}

export const VPCPanel = (props: Props) => {
  const {
    disabled,
    errors,
    ipv4Change,
    regionSelected,
    vpcSelected,
    vpcChange,
    subnets,
    subnetChange,
  } = props;

  const regionSupportsVPC =
    regionSelected?.capabilities.includes('VPCs') || false;

  const {
    data: vpcs,
    error: vpcError,
    isLoading: isVPCLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPC,
    filter: { region: regionSelected?.id || '' },
  });

  const getVPCSubnetLabelFromId = (subnetId: number): string => {
    const subnet = vpcSelected?.subnets.find(
      ({ id, ...rest }) => id === subnetId
    );
    return subnet?.label || '';
  };

  return (
    <Paper data-testid="vpc-panel">
      <Stack spacing={2}>
        <Typography variant="h2">VPC</Typography>
        <Stack spacing={1.5}>
          <Autocomplete
            disabled={disabled}
            errorText={vpcError?.[0].reason}
            helperText={
              regionSelected && !regionSupportsVPC
                ? 'VPC is not available in the selected region.'
                : undefined
            }
            label="Assign VPC"
            loading={isVPCLoading}
            noMarginTop
            noOptionsText={
              !regionSelected
                ? 'Select a region to see available VPCs.'
                : 'There are no VPCs in the selected region.'
            }
            onChange={(e, vpc) => {
              vpcChange(vpc ?? null);

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
            }}
            value={vpcSelected ?? null}
          />
          {vpcSelected && (
            <>
              <Autocomplete
                errorText={
                  errors.find((err) => err.field?.includes('subnet_id'))?.reason
                }
                getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
                label="Subnet"
                noMarginTop
                onChange={(_, subnet) =>
                  subnetChange(subnet ? [subnet.id] : null)
                }
                options={vpcSelected?.subnets ?? []}
                placeholder="Select Subnet"
                value={
                  vpcSelected?.subnets.find(
                    (subnet) => subnet.id === subnets?.[0].subnet_id
                  ) ?? null
                }
              />
              {subnets &&
                subnets.map((vpc, index) => (
                  <TextField
                    errorText={
                      errors.find(
                        (err) =>
                          err.field?.includes(`vpcs[${index}].ipv4_range`) ||
                          err.field?.includes(`nodes[${index}].ipv4_range`)
                      )?.reason
                    }
                    key={`${vpc.subnet_id}`}
                    label={`NodeBalancer IPv4 CIDR for ${getVPCSubnetLabelFromId(vpc.subnet_id)}`}
                    noMarginTop
                    onChange={(e) => ipv4Change(e.target.value ?? '', index)}
                    // eslint-disable-next-line sonarjs/no-hardcoded-ip
                    placeholder="10.0.0.24"
                    required
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">/30</InputAdornment>
                        ),
                      },
                    }}
                    value={vpc.ipv4_range}
                  />
                ))}
            </>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
