import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { REGION_CAVEAT_HELPER_TEXT } from 'src/features/VPCs/constants';

import { useIsLkeEnterpriseEnabled } from '../kubeUtils';

interface Props {
  selectedRegionId: string | undefined;
}

export const ClusterNetworkingPanel = (props: Props) => {
  const { selectedRegionId } = props;

  const { isLkeEnterprisePhase2FeatureEnabled } = useIsLkeEnterpriseEnabled();

  const [isUsingOwnVpc, setIsUsingOwnVpc] = useState(false);

  const { control, setValue, resetField } = useFormContext();
  const [selectedVPCId] = useWatch({
    control,
    name: ['vpc_id', 'subnet_id'],
  });

  const { data: region } = useRegionQuery(selectedRegionId ?? '');
  const regionSupportsVPCs = region?.capabilities.includes('VPCs') ?? false;

  const {
    data: vpcs,
    error,
    isLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region: selectedRegionId },
  });
  const selectedVPC = vpcs?.find((vpc) => vpc.id === selectedVPCId);

  return isLkeEnterprisePhase2FeatureEnabled ? (
    <Stack divider={<Divider />} spacing={4}>
      <Stack>
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Label.Bold.S,
          })}
        >
          IP Version
        </Typography>
        <Typography marginTop={1}>
          TODO - M3-10203: LKE-E Dual Stack Support
        </Typography>
      </Stack>
      <Stack marginTop={3}>
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Label.Bold.S,
          })}
        >
          VPC
        </Typography>
        <Typography marginTop={1}>
          Allow for private communications within and across clusters in the
          same data center.
        </Typography>
        <RadioGroup
          aria-label="Bring your own VPC"
          data-testid="isUsingOwnVpc"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setIsUsingOwnVpc(e.target.value === 'yes');
          }}
          value={isUsingOwnVpc}
        >
          <FormControlLabel
            checked={!isUsingOwnVpc}
            control={<Radio />}
            label="Automatically generate a VPC for this cluster"
            value="no"
          />
          <FormControlLabel
            checked={isUsingOwnVpc}
            control={<Radio />}
            label="Use an existing VPC"
            value="yes"
          />
        </RadioGroup>

        {isUsingOwnVpc && (
          <Stack spacing={2}>
            <Controller
              control={control}
              name="vpc_id"
              render={({ field, fieldState }) => (
                <Autocomplete
                  disabled={!regionSupportsVPCs}
                  errorText={error?.[0].reason ?? fieldState.error?.message}
                  helperText={
                    !selectedRegionId
                      ? 'Select a region to see available VPCs.'
                      : undefined
                  }
                  label="VPC"
                  loading={isLoading}
                  noMarginTop
                  noOptionsText="There are no VPCs in the selected region."
                  onBlur={field.onBlur}
                  onChange={(e, vpc) => {
                    field.onChange(vpc?.id ?? null);
                    if (vpc && vpc.subnets.length === 1) {
                      // If the user selects a VPC and the VPC only has one subnet,
                      // preselect that subnet for the user.
                      setValue('subnet_id', vpc.subnets[0].id, {
                        shouldValidate: true,
                      });
                    } else {
                      // Otherwise, just clear the selected subnet.
                      resetField('subnet_id');
                    }
                  }}
                  options={vpcs ?? []}
                  placeholder="Select a VPC"
                  textFieldProps={{
                    tooltipText: REGION_CAVEAT_HELPER_TEXT,
                  }}
                  value={selectedVPC ?? null}
                />
              )}
            />
            <Controller
              control={control}
              name="subnet_id"
              render={({ field, fieldState }) => (
                <Autocomplete
                  disabled={!selectedVPC}
                  errorText={fieldState.error?.message}
                  getOptionLabel={(subnet) =>
                    `${subnet.label} (${subnet.ipv4})`
                  }
                  label="Subnet"
                  loading={isLoading}
                  noMarginTop
                  onBlur={field.onBlur}
                  onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
                  options={selectedVPC?.subnets ?? []}
                  placeholder="Select a Subnet"
                  value={
                    selectedVPC?.subnets.find((s) => s.id === field.value) ??
                    null
                  }
                />
              )}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  ) : (
    <Stack>
      <Typography variant="h3">VPC & Firewall</Typography>
      <Typography marginTop={1}>
        A VPC and Firewall are automatically generated for LKE Enterprise
        customers.
      </Typography>
    </Stack>
  );
};
