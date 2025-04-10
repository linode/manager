import { Box, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { IPv4AddressRow } from './IPv4AddressRow';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

export const PublicIPv4Addresses = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();
  const { fields, append, remove } = useFieldArray({
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>IPv4 Address</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.length === 0 && (
            <TableRowEmpty
              colSpan={2}
              message="No IPv4s assigned to this interface."
            />
          )}
          {fields.map(({ id, address, primary }, index) => (
            <IPv4AddressRow
              address={address}
              index={index}
              key={id}
              onRemove={() => remove(index)}
              primary={primary ?? false}
            />
          ))}
        </TableBody>
      </Table>
      <Box>
        <LinkButton
          onClick={() =>
            append({ address: 'auto', primary: fields.length === 0 })
          }
        >
          Add IPv4 Address
        </LinkButton>
      </Box>
    </Stack>
  );
};
