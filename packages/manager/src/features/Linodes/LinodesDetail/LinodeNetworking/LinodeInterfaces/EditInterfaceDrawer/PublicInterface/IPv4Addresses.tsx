import { Box, Stack, Typography } from '@linode/ui';
import React, { useState } from 'react';

import { LinkButton } from 'src/components/LinkButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { DeleteIPv4Dialog } from './DeleteIPv4Dialog';
import { IPv4AddressRow } from './IPv4AddressRow';
import { ipv4AddressSorter, useAllocatePublicIPv4 } from './utilities';

import type { LinodeInterface } from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeInterface: LinodeInterface;
}

export const PublicIPv4Addresses = ({ linodeId, linodeInterface }: Props) => {
  const [selectedAddress, setSelectedAddress] = useState<string>();

  const { isAllocating, onAllocate } = useAllocatePublicIPv4({
    interfaceId: linodeInterface.id,
    linodeId,
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
          {linodeInterface.public?.ipv4.addresses.length === 0 && (
            <TableRowEmpty
              colSpan={2}
              message="No IPv4s assigned to this interface."
            />
          )}
          {linodeInterface.public?.ipv4.addresses
            // We have to client-side sort because the API's reponse order is never consistent
            .sort(ipv4AddressSorter)
            .map(({ address, primary }) => (
              <IPv4AddressRow
                address={address}
                interfaceId={linodeInterface.id}
                key={address}
                linodeId={linodeId}
                onDelete={() => setSelectedAddress(address)}
                primary={primary}
              />
            ))}
        </TableBody>
      </Table>
      <Box>
        <LinkButton isLoading={isAllocating} onClick={onAllocate}>
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
