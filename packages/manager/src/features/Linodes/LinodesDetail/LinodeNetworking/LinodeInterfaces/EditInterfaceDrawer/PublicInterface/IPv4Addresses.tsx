import { Box, LinkButton, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { IPv4AddressRow } from './IPv4AddressRow';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  linodeId: number;
}

export const PublicIPv4Addresses = (props: Props) => {
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
          {fields.map(({ id, address }, index) => (
            <IPv4AddressRow
              address={address}
              index={index}
              key={id}
              linodeId={props.linodeId}
              onRemove={() => remove(index)}
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
