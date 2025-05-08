import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Notice,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { VPCPublicIPLabel } from 'src/features/VPCs/components/VPCPublicIPLabel';
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
} from 'src/features/VPCs/constants';
import { VPCCreateDrawer } from 'src/features/VPCs/VPCCreateDrawer/VPCCreateDrawer';

import { VPCAvailabilityNotice } from './VPCAvailabilityNotice';
import { VPCRanges } from './VPCRanges';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const VPC = ({ index }: Props) => {
  const {
    control,
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

  const selectedVPC = vpcs?.find((vpc) => vpc.id === selectedVPCId);

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
                  // If the user selectes a VPC and the VPC only has one subnet,
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
                      <Typography>
                        Auto-assign a VPC IPv4 address for this Linode in the
                        VPC
                      </Typography>
                      <TooltipIcon text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP} />
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
        </Stack>
        <VPCRanges disabled={!regionSupportsVPCs} interfaceIndex={index} />
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
