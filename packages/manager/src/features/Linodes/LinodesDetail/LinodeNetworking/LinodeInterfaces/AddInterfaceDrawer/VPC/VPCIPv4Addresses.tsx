import { Stack } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { VPCIPv4Address } from './VPCIPv4Address';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCIPv4Addresses = () => {
  const { control } = useFormContext<CreateInterfaceFormValues>();

  /**
   * We currently enforce a hard limit of one IPv4 address per VPC interface.
   * See VPC-2044.
   *
   * Eventually, we should all the user to append/remove more VPC IPs
   */
  const { fields } = useFieldArray({
    control,
    name: 'vpc.ipv4.addresses',
  });

  return (
    <Stack spacing={1}>
      {fields.map((field, index) => (
        <VPCIPv4Address index={index} key={field.id} />
      ))}
    </Stack>
  );
};
