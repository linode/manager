import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Notice,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { LinkButton } from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  VPCIPv6PublicIPLabel,
  VPCPublicIPLabel,
} from 'src/features/VPCs/components/VPCPublicIPLabel';
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
  VPC_AUTO_ASSIGN_IPV6_TOOLTIP,
  VPC_IPV4_INPUT_HELPER_TEXT,
  VPC_IPV6_INPUT_HELPER_TEXT,
} from 'src/features/VPCs/constants';
import { VPCCreateDrawer } from 'src/features/VPCs/VPCCreateDrawer/VPCCreateDrawer';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';

import { VPCAvailabilityNotice } from './VPCAvailabilityNotice';
import { VPCIPv6Ranges } from './VPCIPv6Ranges';
import { VPCRanges } from './VPCRanges';

import type { LinodeCreateFormValues } from '../utilities';
import type { Theme } from '@linode/ui';

interface Props {
  index: number;
}

export const VPC = ({ index }: Props) => {
  const {
    control,
    getValues,
    resetField,
    setValue,
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const [regionId, selectedVPCId] = useWatch({
    control,
    name: ['region', `linodeInterfaces.${index}.vpc.vpc_id`],
  });

  const { data: selectedRegion } = useRegionQuery(regionId);

  const regionSupportsVPCs =
    selectedRegion?.capabilities.includes('VPCs') ?? false;

  const {
    data: vpcs,
    error,
    isLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region: regionId },
  });

  const { isDualStackEnabled } = useVPCDualStack();

  const selectedVPC = vpcs?.find((vpc) => vpc.id === selectedVPCId);

  // Check that selected subnet supports IPv6
  const selectedSubnet = selectedVPC?.subnets.find(
    (subnet) =>
      subnet.id === getValues(`linodeInterfaces.${index}.vpc.subnet_id`)
  );

  const showIPv6Fields =
    isDualStackEnabled &&
    Boolean(selectedSubnet?.ipv6?.length && selectedSubnet?.ipv6?.length > 0);

  return (
    <Box>
      <Stack spacing={1.5}>
        {selectedRegion && !regionSupportsVPCs && <VPCAvailabilityNotice />}
        <Controller
          control={control}
          name={`linodeInterfaces.${index}.vpc.vpc_id`}
          render={({ field, fieldState }) => (
            <Autocomplete
              disabled={!regionSupportsVPCs}
              errorText={error?.[0].reason ?? fieldState.error?.message}
              helperText={
                !regionId ? 'Select a region to see available VPCs.' : undefined
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
                  setValue(
                    `linodeInterfaces.${index}.vpc.subnet_id`,
                    vpc.subnets[0].id,
                    { shouldValidate: true }
                  );
                } else {
                  // Otherwise, just clear the selected subnet
                  resetField(`linodeInterfaces.${index}.vpc.subnet_id`);
                }
              }}
              options={vpcs ?? []}
              placeholder="None"
              textFieldProps={{
                tooltipText: REGION_CAVEAT_HELPER_TEXT,
              }}
              value={selectedVPC ?? null}
            />
          )}
        />
        {regionId && regionSupportsVPCs && (
          <Box>
            <LinkButton onClick={() => setIsCreateDrawerOpen(true)}>
              Create VPC
            </LinkButton>
          </Box>
        )}
        <Controller
          control={control}
          name={`linodeInterfaces.${index}.vpc.subnet_id`}
          render={({ field, fieldState }) => (
            <Autocomplete
              disabled={!regionSupportsVPCs}
              errorText={fieldState.error?.message}
              getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
              label="Subnet"
              noMarginTop
              onBlur={field.onBlur}
              onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
              options={selectedVPC?.subnets ?? []}
              placeholder="Select Subnet"
              value={
                selectedVPC?.subnets.find(
                  (subnet) => subnet.id === field.value
                ) ?? null
              }
            />
          )}
        />
        <Stack>
          <Controller
            control={control}
            name={`linodeInterfaces.${index}.vpc.ipv4.addresses.0.address`}
            render={({ field, fieldState }) => (
              <Box>
                <FormControlLabel
                  checked={field.value === 'auto'}
                  control={<Checkbox sx={{ ml: 0.4 }} />}
                  disabled={!regionSupportsVPCs}
                  label={
                    <Stack alignItems="center" direction="row">
                      <Typography>Auto-assign VPC IPv4</Typography>
                      <TooltipIcon
                        status="info"
                        text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP}
                      />
                    </Stack>
                  }
                  onChange={(e, checked) =>
                    field.onChange(checked ? 'auto' : '')
                  }
                />
                {field.value !== 'auto' && (
                  <TextField
                    containerProps={{ sx: { mb: 1.5, mt: 1 } }}
                    errorText={
                      fieldState.error?.message ??
                      errors.linodeInterfaces?.[index]?.vpc?.ipv4
                        ?.addresses?.[0]?.message
                    }
                    helperText={VPC_IPV4_INPUT_HELPER_TEXT}
                    label="VPC IPv4"
                    noMarginTop
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    required
                    value={field.value}
                  />
                )}
              </Box>
            )}
          />
          {showIPv6Fields && (
            <Controller
              control={control}
              name={`linodeInterfaces.${index}.vpc.ipv6.slaac.0.range`}
              render={({ field, fieldState }) => (
                <Box>
                  <FormControlLabel
                    checked={field.value === 'auto'}
                    control={<Checkbox sx={{ ml: 0.4 }} />}
                    disabled={!regionSupportsVPCs}
                    label={
                      <Stack alignItems="center" direction="row">
                        <Typography>Auto-assign VPC IPv6</Typography>
                        <TooltipIcon
                          status="info"
                          text={VPC_AUTO_ASSIGN_IPV6_TOOLTIP}
                        />
                      </Stack>
                    }
                    onChange={(e, checked) =>
                      field.onChange(checked ? 'auto' : '')
                    }
                  />
                  {field.value !== 'auto' && (
                    <TextField
                      containerProps={{ sx: { mb: 1.5, mt: 1 } }}
                      errorText={
                        fieldState.error?.message ??
                        errors.linodeInterfaces?.[index]?.vpc?.ipv6?.slaac?.[0]
                          ?.range?.message
                      }
                      helperText={VPC_IPV6_INPUT_HELPER_TEXT}
                      label="VPC IPv6"
                      noMarginTop
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      required
                      value={field.value}
                    />
                  )}
                </Box>
              )}
            />
          )}
          <Box>
            <Divider
              sx={(theme) => ({ marginBottom: theme.spacingFunction(16) })}
            />
            <Typography sx={(theme: Theme) => ({ font: theme.font.bold })}>
              Public access
            </Typography>
            <Controller
              control={control}
              name={`linodeInterfaces.${index}.vpc.ipv4.addresses.0.nat_1_1_address`}
              render={({ field, fieldState }) => (
                <Box>
                  {fieldState.error?.message && (
                    <Notice text={fieldState.error.message} variant="error" />
                  )}
                  <FormControlLabel
                    checked={field.value === 'auto'}
                    control={<Checkbox sx={{ ml: 0.4 }} />}
                    disabled={!regionSupportsVPCs}
                    label={<VPCPublicIPLabel />}
                    onChange={(e, checked) =>
                      field.onChange(checked ? 'auto' : null)
                    }
                  />
                </Box>
              )}
            />
            {showIPv6Fields && (
              <Controller
                control={control}
                name={`linodeInterfaces.${index}.vpc.ipv6.is_public`}
                render={({ field, fieldState }) => (
                  <Box>
                    {fieldState.error?.message && (
                      <Notice text={fieldState.error.message} variant="error" />
                    )}
                    <FormControlLabel
                      checked={field.value === true}
                      control={<Checkbox sx={{ ml: 0.4 }} />}
                      disabled={!regionSupportsVPCs}
                      label={<VPCIPv6PublicIPLabel />}
                      onChange={() => field.onChange(!field.value)}
                    />
                  </Box>
                )}
              />
            )}
            <Divider
              sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}
            />
          </Box>
        </Stack>
        <VPCRanges disabled={!regionSupportsVPCs} interfaceIndex={index} />
        {showIPv6Fields && (
          <VPCIPv6Ranges
            disabled={!regionSupportsVPCs}
            interfaceIndex={index}
          />
        )}
      </Stack>
      <VPCCreateDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        onSuccess={(vpc) => {
          setValue(`linodeInterfaces.${index}.vpc.vpc_id`, vpc.id, {
            shouldValidate: true,
          });

          if (vpc.subnets.length === 1) {
            // If the user creates a VPC with just one subnet,
            // preselect it for them
            setValue(
              `linodeInterfaces.${index}.vpc.subnet_id`,
              vpc.subnets[0].id,
              {
                shouldValidate: true,
              }
            );
          }
        }}
        open={isCreateDrawerOpen}
        selectedRegion={regionId}
      />
    </Box>
  );
};
