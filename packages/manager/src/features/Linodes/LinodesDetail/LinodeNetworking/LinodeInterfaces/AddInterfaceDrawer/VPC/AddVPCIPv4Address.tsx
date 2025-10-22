import { Notice, Stack } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCIPv4Address } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/VPCIPv4Address';

import type { CreateInterfaceFormValues } from '../utilities';

interface Props {
  index: number;
}

export const AddVPCIPv4Address = (props: Props) => {
  const { index } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateInterfaceFormValues>();

  const error = errors.vpc?.ipv4?.addresses?.[index]?.message;

  return (
    <Stack spacing={1}>
      {error && (
        <Notice variant="error">
          <ErrorMessage message={error} />
        </Notice>
      )}
      <Controller
        control={control}
        name={`vpc.ipv4.addresses.${index}.address`}
        render={({ field, fieldState }) => (
          <VPCIPv4Address
            autoAssignIdentifier="auto"
            errorMessage={fieldState.error?.message}
            fieldValue={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </Stack>
  );
};
