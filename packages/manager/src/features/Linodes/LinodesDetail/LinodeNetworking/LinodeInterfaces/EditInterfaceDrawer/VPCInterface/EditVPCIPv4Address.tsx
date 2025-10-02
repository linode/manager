import { Notice, Stack } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCIPv4Address } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/VPCIPv4Address';

import type {
  LinodeInterface,
  ModifyLinodeInterfacePayload,
} from '@linode/api-v4';

interface Props {
  index: number;
  linodeInterface: LinodeInterface;
}

export const EditVPCIPv4Address = (props: Props) => {
  const { index, linodeInterface } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const error = errors.vpc?.ipv4?.addresses?.[index]?.message;

  return (
    <Stack spacing={1}>
      {error && (
        <Notice variant="error">
          <ErrorMessage message={error} />
        </Notice>
      )}
      <Stack spacing={1.5}>
        <Controller
          control={control}
          name={`vpc.ipv4.addresses.${index}.address`}
          render={({ field, fieldState }) => (
            <VPCIPv4Address
              errorMessage={fieldState.error?.message}
              fieldValue={field.value}
              ipv4Address={linodeInterface.vpc?.ipv4?.addresses[index].address}
              onChange={field.onChange}
            />
          )}
        />
      </Stack>
    </Stack>
  );
};
