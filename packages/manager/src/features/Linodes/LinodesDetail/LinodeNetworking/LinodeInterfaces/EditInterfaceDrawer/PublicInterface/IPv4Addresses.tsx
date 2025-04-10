import { Box, Stack, Typography } from '@linode/ui';
import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { DeleteIPv4Dialog } from './DeleteIPv4Dialog';
import { IPv4AddressRow } from './IPv4AddressRow';

import type {
  LinodeInterface,
  ModifyLinodeInterfacePayload,
} from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeInterface: LinodeInterface;
}

export const PublicIPv4Addresses = ({ linodeId, linodeInterface }: Props) => {
  const [selectedAddress, setSelectedAddress] = useState<string>();

  const { control } = useFormContext<ModifyLinodeInterfacePayload>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'public.ipv4.addresses',
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="h3">IPv4 Addresses</Typography>
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
          {fields
            // We have to client-side sort because the API's reponse order is never consistent
            // .sort(ipv4AddressSorter)
            .map(({ id, address, primary }, index) => (
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
        <LinkButton onClick={() => append({ address: 'auto' })}>
          Add IPv4 Address
        </LinkButton>
      </Box>
      <DeleteIPv4Dialog
        address={selectedAddress}
        interfaceId={linodeInterface.id}
        linodeId={linodeId}
        onClose={() => setSelectedAddress(undefined)}
        open={selectedAddress !== undefined}
      />
    </Stack>
  );
};
