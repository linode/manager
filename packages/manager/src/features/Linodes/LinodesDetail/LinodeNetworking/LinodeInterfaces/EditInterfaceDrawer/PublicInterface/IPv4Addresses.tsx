import { Box, Chip, Stack, Typography } from '@linode/ui';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { LinkButton } from 'src/components/LinkButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { useAllocatePublicIPv4, useMakeIPv4Primary } from './utilities';

import type { LinodeInterface } from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeInterface: LinodeInterface;
}

export const PublicIPv4Addresses = ({ linodeId, linodeInterface }: Props) => {
  const { isAllocating, onAllocate } = useAllocatePublicIPv4({
    interfaceId: linodeInterface.id,
    linodeId,
  });

  const { isPending, onMakePrimary } = useMakeIPv4Primary({
    interfaceId: linodeInterface.id,
    linodeId: linodeId
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
          {linodeInterface.public?.ipv4.addresses.map(
            ({ address, primary }) => (
              <TableRow key={address}>
                <TableCell>
                  <Stack alignItems="center" direction="row" gap={1.5}>
                    {address}
                    {primary && <Chip color="primary" label="Primary" />}
                  </Stack>
                </TableCell>
                <TableCell actionCell>
                  <InlineMenuAction
                    actionText="Make Primary"
                    disabled={primary}
                    loading={isPending}
                    onClick={() => onMakePrimary(address)}
                  />
                  <InlineMenuAction actionText="Delete" />
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
      <Box>
        <LinkButton isLoading={isAllocating} onClick={onAllocate}>
          Add IPv4 Address
        </LinkButton>
      </Box>
    </Stack>
  );
};
