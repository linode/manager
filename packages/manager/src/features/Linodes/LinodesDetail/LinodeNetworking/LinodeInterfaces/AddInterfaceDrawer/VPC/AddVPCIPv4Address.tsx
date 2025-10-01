import { Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCIPv4Address } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/VPCIPv4Address';
import { VPC_AUTO_ASSIGN_IPV4_TOOLTIP } from 'src/features/VPCs/constants';

import type { CreateInterfaceFormValues } from '../utilities';

interface Props {
  index: number;
  isDualStackVPC: boolean;
}

export const AddVPCIPv4Address = (props: Props) => {
  const { index, isDualStackVPC } = props;
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
            errorMessage={fieldState.error?.message}
            fieldValue={field.value}
            helperText={
              isDualStackVPC ? (
                <Typography component="span">
                  Automatically assign an IPv4 address as{' '}
                  {isDualStackVPC ? 'a' : 'the'} private IP address for this
                  Linode in the VPC.
                </Typography>
              ) : (
                VPC_AUTO_ASSIGN_IPV4_TOOLTIP
              )
            }
            onChange={field.onChange}
          />
        )}
      />
    </Stack>
  );
};
