import { Notice, Stack } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCIPv6Address } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/VPCIPv6Address';

import type {
  LinodeInterface,
  ModifyLinodeInterfacePayload,
} from '@linode/api-v4';

interface Props {
  linodeInterface: LinodeInterface;
}

export const EditVPCIPv6Address = (props: Props) => {
  const { linodeInterface } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

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
            ipv6Address={linodeInterface.vpc?.ipv6?.slaac[0].range}
            onChange={field.onChange}
          />
        )}
      />
    </Stack>
  );
};
