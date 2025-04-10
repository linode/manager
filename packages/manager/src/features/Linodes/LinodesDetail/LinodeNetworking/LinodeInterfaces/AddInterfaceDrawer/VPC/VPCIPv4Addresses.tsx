import { Box, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';

import { VPCIPv4Address } from './VPCIPv4Address';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCIPv4Addresses = () => {
  const { control } = useFormContext<CreateInterfaceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vpc.ipv4.addresses',
  });

  return (
    <Stack spacing={1}>
      <Typography variant="h3">VPC IPv4 Addresses</Typography>
      <Typography>
        Configure addresses for this interface within the private network of the
        subnet.
      </Typography>
      {fields.map((field, index) => (
        <VPCIPv4Address
          index={index}
          key={field.id}
          onRemove={() => remove(index)}
        />
      ))}
      <Box>
        <LinkButton onClick={() => append({ address: 'auto' })}>
          Add another VPC IPv4 Address
        </LinkButton>
      </Box>
    </Stack>
  );
};
