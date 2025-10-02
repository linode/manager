import { useVPCQuery } from '@linode/queries';
import { Stack } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { useVPCDualStack } from 'src/hooks/useVPCDualStack';

import { VPCIPv4Address } from './VPCIPv4Address';
import { VPCIPv6Address } from './VPCIPv6Address';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCIPAddresses = () => {
  const { control } = useFormContext<CreateInterfaceFormValues>();

  const vpcId = useWatch({
    control,
    name: 'vpc.vpc_id',
  });
  const { isDualStackEnabled } = useVPCDualStack();
  const { data: vpc } = useVPCQuery(vpcId, Boolean(vpcId));
  const isDualStackVPC = isDualStackEnabled && Boolean(vpc?.ipv6);

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
      {fields.map((field, index) => (
        <VPCIPv4Address index={index} key={field.id} />
      ))}
      {isDualStackVPC && <VPCIPv6Address />}
    </Stack>
  );
};
