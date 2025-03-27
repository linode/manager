import { useAllVPCsQuery } from '@linode/queries';
import { Autocomplete, Stack } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import type { CreateInterfaceFormValues } from './utilities';

interface Props {
  regionId: string;
}

export const VPCInterface = (props: Props) => {
  const { regionId } = props;
  const {
    control,
    resetField,
    setValue,
  } = useFormContext<CreateInterfaceFormValues>();

  const { data: vpcs, error, isLoading } = useAllVPCsQuery({
    filter: { region: regionId },
  });

  const [vpcId] = useWatch({ control, name: ['vpc.vpc_id'] });

  const selectedVPC = vpcs?.find((vpc) => vpc.id === vpcId) ?? null;

  return (
    <Stack spacing={2}>
      <Controller
        render={({ field, fieldState }) => (
          <Autocomplete
            onChange={(e, vpc) => {
              field.onChange(vpc?.id ?? null);

              if (vpc && vpc.subnets.length === 1) {
                // If the user selectes a VPC and the VPC only has one subnet,
                // preselect that subnet for the user.
                setValue('vpc.subnet_id', vpc.subnets[0].id, {
                  shouldValidate: true,
                });
              } else {
                // Otherwise, just clear the selected subnet
                resetField('vpc.subnet_id');
              }
            }}
            errorText={fieldState.error?.message ?? error?.[0].reason}
            label="VPC"
            loading={isLoading}
            noMarginTop
            onBlur={field.onBlur}
            options={vpcs ?? []}
            placeholder="Select a VPC"
            value={selectedVPC}
          />
        )}
        control={control}
        name="vpc.vpc_id"
      />
      <Controller
        render={({ field, fieldState }) => (
          <Autocomplete
            value={
              selectedVPC?.subnets.find((s) => s.id === field.value) ?? null
            }
            disabled={!selectedVPC}
            errorText={fieldState.error?.message}
            label="Subnet"
            loading={isLoading}
            noMarginTop
            onBlur={field.onBlur}
            onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
            options={selectedVPC?.subnets ?? []}
            placeholder="Select a Subnet"
          />
        )}
        control={control}
        name="vpc.subnet_id"
      />
    </Stack>
  );
};
