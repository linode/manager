import { Notice, Stack } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCIPv6Address } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/VPCIPv6Address';

import type { CreateInterfaceFormValues } from '../utilities';

export const AddVPCIPv6Address = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateInterfaceFormValues>();

  const error = errors.vpc?.ipv6?.message;

  return (
    <Stack spacing={1}>
      {error && (
        <Notice variant="error">
          <ErrorMessage message={error} />
        </Notice>
      )}
      <Controller
        control={control}
        name="vpc.ipv6.slaac.0.range"
        render={({ field, fieldState }) => (
          <VPCIPv6Address
            errorMessage={fieldState.error?.message}
            fieldValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </Stack>
  );
};
