import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import { Autocomplete, Box, Stack } from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { REGION_CAVEAT_HELPER_TEXT } from 'src/features/VPCs/constants';
import { VPCCreateDrawer } from 'src/features/VPCs/VPCCreateDrawer/VPCCreateDrawer';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const VPC = ({ index }: Props) => {
  const { control, setValue } = useFormContext<LinodeCreateFormValues>();
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

  return (
    <Box>
      <Stack spacing={1.5}>
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              helperText={
                !regionId
                  ? 'Select a region to see available VPCs.'
                  : selectedRegion && !regionSupportsVPCs
                  ? 'VPC is not available in the selected region.'
                  : undefined
              }
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
                  setValue(
                    `linodeInterfaces.${index}.vpc.subnet_id`,
                    undefined
                  );
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
      </Stack>
      <VPCCreateDrawer
        onSuccess={(vpc) => {
          setValue(`linodeInterfaces.${index}.vpc.vpc_id`, vpc.id);

          if (vpc.subnets.length === 1) {
            // If the user creates a VPC with just one subnet,
            // preselect it for them
            setValue(
              `linodeInterfaces.${index}.vpc.subnet_id`,
              vpc.subnets[0].id
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
