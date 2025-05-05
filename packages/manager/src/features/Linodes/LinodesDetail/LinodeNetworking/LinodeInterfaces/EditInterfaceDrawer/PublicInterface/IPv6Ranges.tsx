import { Box, LinkButton, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { IPv6RangeRow } from './IPv6RangeRow';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  linodeId: number;
}

export const IPv6Ranges = ({ linodeId }: Props) => {
  const { control } = useFormContext<ModifyLinodeInterfacePayload>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'public.ipv6.ranges',
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="h3">IPv6 Ranges</Typography>
      <Typography>
        IPv6 addresses are allocated in ranges, which you can distribute and
        route as needed.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/an-overview-of-ipv6-on-linode#additional-ipv6-addresses">
          Learn more
        </Link>
        .
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>IPv6 Range</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.length === 0 && (
            <TableRowEmpty
              colSpan={2}
              message="No IPv6 ranges are assigned to this interface."
            />
          )}
          {fields.map(({ id, range }, index) => (
            <IPv6RangeRow
              index={index}
              key={id}
              linodeId={linodeId}
              onRemove={() => remove(index)}
              range={range!}
            />
          ))}
        </TableBody>
      </Table>
      <Stack spacing={1}>
        <Box>
          <LinkButton onClick={() => append({ range: '/56' })}>
            Add IPv6 /56 Range
          </LinkButton>
        </Box>
        <Box>
          <LinkButton onClick={() => append({ range: '/64' })}>
            Add IPv6 /64 Range
          </LinkButton>
        </Box>
      </Stack>
    </Stack>
  );
};
