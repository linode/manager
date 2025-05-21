import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { NODEBALANCER_REGION_CAVEAT_HELPER_TEXT } from '../VPCs/constants';

import type { APIError, NodeBalancerVpcPayload, VPC } from '@linode/api-v4';

export interface Props {
  disabled?: boolean;
  errors?: APIError[];
  ipv4Change: (ipv4Range: string, index: number) => void;
  regionSelected: string;
  setIsVpcSelected: (vpc: boolean) => void;
  subnetChange: (subnetIds: null | number[]) => void;
  subnets?: NodeBalancerVpcPayload[];
}

export const VPCPanel = (props: Props) => {
  const {
    disabled,
    errors,
    ipv4Change,
    regionSelected,
    setIsVpcSelected,
    subnets,
    subnetChange,
  } = props;

  const { data: region } = useRegionQuery(regionSelected);

  const regionSupportsVPC = region?.capabilities.includes('VPCs') || false;

  const {
    data: vpcs,
    error: error,
    isLoading: isVPCLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPC,
    filter: { region: regionSelected },
  });

  const [VPCSelected, setVPCSelected] = React.useState<null | VPC>(null);

  React.useEffect(() => {
    setVPCSelected(null);
  }, [regionSelected]);

  const getVPCSubnetLabelFromId = (subnetId: number): string => {
    const subnet = VPCSelected?.subnets.find(({ id }) => id === subnetId);
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
          <Autocomplete
            disabled={disabled}
            errorText={vpcError}
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
              setVPCSelected(vpc ?? null);
              setIsVpcSelected(Boolean(vpc));

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
            value={VPCSelected ?? null}
          />
          {VPCSelected && (
            <>
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
                options={VPCSelected?.subnets ?? []}
                placeholder="Select Subnet"
                value={
                  VPCSelected?.subnets.find(
                    (subnet) => subnet.id === subnets?.[0].subnet_id
                  ) ?? null
                }
              />
              {subnets &&
                subnets.map((vpc, index) => (
                  <TextField
                    errorText={
                      errors?.find((err) =>
                        err.field?.includes(`vpcs[${index}].ipv4_range`)
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
