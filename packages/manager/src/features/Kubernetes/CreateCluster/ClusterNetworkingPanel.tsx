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
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';
import { REGION_CAVEAT_HELPER_TEXT } from 'src/features/VPCs/constants';

import { useIsLkeEnterpriseEnabled } from '../kubeUtils';

interface Props {
  selectedRegionId: string | undefined;
  subnetErrorText?: string;
  vpcErrorText?: string;
}

export const ClusterNetworkingPanel = (props: Props) => {
  const { selectedRegionId, vpcErrorText, subnetErrorText } = props;

  const [isUsingOwnVpc, setIsUsingOwnVpc] = React.useState(false);

  const { isLkeEnterprisePhase2FeatureEnabled } = useIsLkeEnterpriseEnabled();

  const { control, resetField, clearErrors } = useFormContext();
  const [selectedVPCId] = useWatch({
    control,
    name: ['vpc_id'],
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
    <Stack divider={<Divider />} spacing={3}>
      <Controller
        control={control}
        name="stack_type"
        render={({ field }) => (
          <RadioGroup
            {...field}
            onChange={(e) => field.onChange(e.target.value)}
            value={field.value ?? null}
          >
            <FormLabel>IP Version</FormLabel>
            <FormControlLabel control={<Radio />} label="IPv4" value="ipv4" />
            <FormControlLabel
              control={<Radio />}
              label="IPv4 + IPv6"
              value="ipv4-ipv6"
            />
          </RadioGroup>
        )}
      />
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

            if (!isUsingOwnVpc) {
              clearErrors(['vpc_id', 'subnet_id']);
            }
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
                  errorText={
                    error?.[0].reason ??
                    vpcErrorText ??
                    fieldState.error?.message
                  }
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
                    resetField('subnet_id');
                  }}
                  options={vpcs ?? []}
                  placeholder="Select a VPC"
                  textFieldProps={{
                    tooltipText: REGION_CAVEAT_HELPER_TEXT,
                  }}
                  value={selectedVPC ?? null}
                />
              )}
              rules={{
                validate: (value) => {
                  if (isUsingOwnVpc && !value) {
                    return 'You must either select a VPC or select automatic VPC generation.';
                  }
                  return true;
                },
              }}
            />
            <Controller
              control={control}
              name="subnet_id"
              render={({ field, fieldState }) => (
                <Autocomplete
                  disabled={!selectedVPC}
                  errorText={
                    error?.[0].reason ??
                    subnetErrorText ??
                    fieldState.error?.message
                  }
                  getOptionLabel={(subnet) =>
                    `${subnet.label} (${subnet.ipv4})`
                  }
                  label="Subnet"
                  loading={isLoading}
                  noMarginTop
                  onBlur={field.onBlur}
                  onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
                  options={selectedVPC?.subnets ?? []}
                  placeholder="None"
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
