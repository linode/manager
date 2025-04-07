import { Box, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';

import { PublicIPv4AddressRow } from './PublicIPv4AddressRow';
import { useAllocatePublicIPv4 } from './utilities';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  interfaceId: number;
  linodeId: number;
}

export const PublicIPv4Addresses = (props: Props) => {
  const {
    control,
    formState: { errors, isDirty },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const { isAllocating, onAllocate } = useAllocatePublicIPv4(props);

  const { fields, remove } = useFieldArray({
    control,
    name: 'public.ipv4.addresses',
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="h3">IPv4 Addresses</Typography>
      {errors.public?.ipv4?.addresses?.message && (
        <Notice
          text={errors.public?.ipv4?.addresses?.message}
          variant="error"
        />
      )}
      {fields.length === 0 ? (
        <Typography>No public IPv4 addresses assigned.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableCell sx={{ width: '20px' }}>Primary</TableCell>
            <TableCell />
            <TableCell sx={{ width: '20px' }} />
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <PublicIPv4AddressRow
                index={index}
                key={field.id}
                onRemove={remove}
              />
            ))}
          </TableBody>
        </Table>
      )}
      <Box>
        <LinkButton
          isDisabled={isDirty}
          isLoading={isAllocating}
          onClick={onAllocate}
        >
          Add Public IPv4
        </LinkButton>
      </Box>
    </Stack>
  );
};
