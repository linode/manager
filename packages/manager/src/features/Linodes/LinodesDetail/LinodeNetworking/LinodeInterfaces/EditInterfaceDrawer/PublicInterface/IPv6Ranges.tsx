import { Box, Stack, Typography } from '@linode/ui';
import React, { useState } from 'react';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { DeleteIPv6Dialog } from './DeleteIPv6Dialog';
import { IPv6RangeRow } from './IPv6RangeRow';
import { useAllocateIPv6Range } from './utilities';

import type { LinodeInterface } from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeInterface: LinodeInterface;
}

export const IPv6Ranges = (props: Props) => {
  const { linodeId, linodeInterface } = props;

  const [selectedRange, setSelectedRange] = useState<string>();

  const {
    isAllocating: isAllocating56,
    onAllocate: onAllocate56,
  } = useAllocateIPv6Range({
    interfaceId: linodeInterface.id,
    linodeId,
    prefix: '/56',
  });

  const {
    isAllocating: isAllocating64,
    onAllocate: onAllocate64,
  } = useAllocateIPv6Range({
    interfaceId: linodeInterface.id,
    linodeId,
    prefix: '/64',
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="h3">IPv6 Ranges</Typography>
      <Typography>
        IPv6 addresses are allocated as ranges, which you can choose to
        distribute and further route yourself.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/an-overview-of-ipv6-on-linode#additional-ipv6-addresses">
          Learn mode.
        </Link>
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>IPv4 Address</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {linodeInterface.public?.ipv6.ranges.length === 0 && (
            <TableRowEmpty
              colSpan={2}
              message="No IPv6 ranges are assigned to this interface."
            />
          )}
          {linodeInterface.public?.ipv6.ranges.map(({ range }) => (
            <IPv6RangeRow
              key={range}
              onDelete={() => setSelectedRange(range)}
              range={range}
            />
          ))}
        </TableBody>
      </Table>
      <Stack spacing={1}>
        <Box>
          <LinkButton isLoading={isAllocating56} onClick={onAllocate56}>
            Add IPv6 /56 Range
          </LinkButton>
        </Box>
        <Box>
          <LinkButton isLoading={isAllocating64} onClick={onAllocate64}>
            Add IPv6 /64 Range
          </LinkButton>
        </Box>
      </Stack>
      <DeleteIPv6Dialog
        interfaceId={linodeInterface.id}
        linodeId={linodeId}
        onClose={() => setSelectedRange(undefined)}
        open={selectedRange !== undefined}
        range={selectedRange}
      />
    </Stack>
  );
};
