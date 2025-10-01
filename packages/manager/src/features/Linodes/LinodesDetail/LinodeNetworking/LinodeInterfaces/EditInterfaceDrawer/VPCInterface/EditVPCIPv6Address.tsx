import { useSubnetQuery } from '@linode/queries';
import { Notice, Stack } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCIPv6Address } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/VPCIPv6Address';
import { generateVPCIPv6InputHelperText } from 'src/features/VPCs/utils';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';

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

  const { isDualStackEnabled } = useVPCDualStack();

  const { data: subnet } = useSubnetQuery(
    linodeInterface.vpc?.vpc_id ?? -1,
    linodeInterface.vpc?.subnet_id ?? -1,
    Boolean(
      isDualStackEnabled &&
        linodeInterface.vpc?.vpc_id &&
        linodeInterface.vpc?.subnet_id
    )
  );

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
            helperText={generateVPCIPv6InputHelperText(
              subnet?.ipv6?.[0].range ?? ''
            )}
            ipv6Address={linodeInterface.vpc?.ipv6?.slaac[0].range}
            onChange={field.onChange}
          />
        )}
      />
    </Stack>
  );
};
