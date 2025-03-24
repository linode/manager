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
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
} from 'src/features/VPCs/constants';
import { VPCCreateDrawer } from 'src/features/VPCs/VPCCreateDrawer/VPCCreateDrawer';

import type { LinodeCreateFormValues } from '../utilities';
import { VPCRanges } from './VPCRanges';

interface Props {
  index: number;
}

export const VPC = ({ index }: Props) => {
  const {
    control,
    resetField,
    setValue,
    formState
  } = useFormContext<LinodeCreateFormValues>();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const [regionId, selectedVPCId] = useWatch({
    control,
    name: ['region', `linodeInterfaces.${index}.vpc.vpc_id`],
  });

  const { data: selectedRegion } = useRegionQuery(regionId);

  const regionSupportsVPCs =
    selectedRegion?.capabilities.includes('VPCs') ?? false;

  const { data: vpcs, error, isLoading } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region: regionId },
  });

  const selectedVPC = vpcs?.find((vpc) => vpc.id === selectedVPCId);

  console.log(formState.errors)

  return (
    <Box>
      <Stack spacing={1.5}>
        {!regionId && (
          <Notice
            text="Select a region to see available VPCs."
            variant="warning"
          />
        )}
        {selectedRegion && !regionSupportsVPCs && (
          <Notice
            text="VPC is not available in the selected region."
            variant="warning"
          />
        )}
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
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
              textFieldProps={{
                tooltipText: REGION_CAVEAT_HELPER_TEXT,
              }}
              disabled={!regionSupportsVPCs}
              errorText={error?.[0].reason ?? fieldState.error?.message}
              label="VPC"
              loading={isLoading}
              noMarginTop
              onBlur={field.onBlur}
              options={vpcs ?? []}
              placeholder="None"
              value={selectedVPC ?? null}
            />
          )}
          control={control}
          name={`linodeInterfaces.${index}.vpc.vpc_id`}
        />
        {regionId && regionSupportsVPCs && (
          <Box>
            <LinkButton onClick={() => setIsCreateDrawerOpen(true)}>
              Create VPC
            </LinkButton>
          </Box>
        )}
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              value={
                selectedVPC?.subnets.find(
                  (subnet) => subnet.id === field.value
                ) ?? null
              }
              disabled={!regionSupportsVPCs}
              errorText={fieldState.error?.message}
              getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
              label="Subnet"
              noMarginTop
              onBlur={field.onBlur}
              onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
              options={selectedVPC?.subnets ?? []}
              placeholder="Select Subnet"
            />
          )}
          control={control}
          name={`linodeInterfaces.${index}.vpc.subnet_id`}
        />
        <Controller
          render={({ field, fieldState }) => (
            <>
              <FormControlLabel
                label={
                  <Stack alignItems="center" direction="row">
                    <Typography>
                      Auto-assign a VPC IPv4 address for this Linode in the VPC
                    </Typography>
                    <TooltipIcon
                      status="help"
                      text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP}
                    />
                  </Stack>
                }
                checked={field.value === 'auto'}
                control={<Checkbox sx={{ ml: -1 }} />}
                disabled={!regionSupportsVPCs}
                onChange={(e, checked) => field.onChange(checked ? 'auto' : '')}
              />
              {field.value !== 'auto' && (
                <TextField
                  errorText={fieldState.error?.message}
                  label="VPC IPv4"
                  noMarginTop
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  required
                  value={field.value}
                />
              )}
            </>
          )}
          control={control}
          name={`linodeInterfaces.${index}.vpc.ipv4.addresses.0.address`}
        />
        <Controller
          render={({ field }) => (
            <FormControlLabel
              label={
                <Stack alignItems="center" direction="row">
                  <Typography>
                    Assign a public IPv4 address for this Linode
                  </Typography>
                  <TooltipIcon
                    text={
                      'Access the internet through the public IPv4 address using static 1:1 NAT.'
                    }
                    status="help"
                  />
                </Stack>
              }
              checked={field.value === 'auto'}
              control={<Checkbox sx={{ ml: -1 }} />}
              disabled={!regionSupportsVPCs}
              onChange={(e, checked) => field.onChange(checked ? 'auto' : null)}
            />
          )}
          control={control}
          name={`linodeInterfaces.${index}.vpc.ipv4.addresses.0.nat_1_1_address`}
        />
        <VPCRanges interfaceIndex={index} />
      </Stack>
      <VPCCreateDrawer
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
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
        selectedRegion={regionId}
      />
    </Box>
  );
};
