import { Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';

import { VPCIPv4Address } from './VPCIPv4Address';

import type {
  LinodeInterface,
  ModifyLinodeInterfacePayload,
} from '@linode/api-v4';

interface Props {
  linodeInterface: LinodeInterface;
}

export const VPCIPv4Addresses = (props: Props) => {
  const { linodeInterface } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  /**
   * We currently enforce a hard limit of one IPv4 address per VPC interface.
   * See VPC-2044.
   *
   * @todo Eventually, when the API supports it, we should all the user to append/remove more VPC IPs
   */
  const { fields } = useFieldArray({
    control,
    name: 'vpc.ipv4.addresses',
  });

  return (
    <Stack spacing={1}>
      <Typography variant="h3">IPv4 Addresses</Typography>
      {errors.vpc?.ipv4?.addresses?.message && (
        <Notice variant="error">
          <ErrorMessage message={errors.vpc?.ipv4?.addresses?.message} />
        </Notice>
      )}
      <Stack spacing={2}>
        {fields.map((field, index) => (
          <VPCIPv4Address
            index={index}
            key={field.id}
            linodeInterface={linodeInterface}
          />
        ))}
      </Stack>
    </Stack>
  );
};
