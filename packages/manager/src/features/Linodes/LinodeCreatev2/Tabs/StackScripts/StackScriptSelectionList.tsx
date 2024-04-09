import React from 'react';
import { useController } from 'react-hook-form';
import { Waypoint } from 'react-waypoint';

import { Box } from 'src/components/Box';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { useStackScriptsInfiniteQuery } from 'src/queries/stackscripts';

import { StackScriptSelectionRow } from './StackScriptSelectionRow';

import type { StackScriptTabType } from './utilities';
import type { CreateLinodeRequest } from '@linode/api-v4';

interface Props {
  type: StackScriptTabType;
}

export const StackScriptSelectionList = ({ type }: Props) => {
  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'deployments_total',
  });

  const { field } = useController<CreateLinodeRequest, 'stackscript_id'>({
    name: 'stackscript_id',
  });

  const filter =
    type === 'Community'
      ? {
          '+and': [
            { username: { '+neq': 'linode' } },
            { username: { '+neq': 'linode-stackscripts' } },
          ],
          mine: false,
        }
      : { mine: true };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useStackScriptsInfiniteQuery({
    ['+order']: order,
    ['+order_by']: orderBy,
    ...filter,
  });

  const stackscripts = data?.pages.flatMap((page) => page.data);

  return (
    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 20 }}></TableCell>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              StackScript
            </TableSortCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stackscripts?.map((stackscript) => (
            <StackScriptSelectionRow
              isSelected={field.value === stackscript.id}
              key={stackscript.id}
              onSelect={() => field.onChange(stackscript.id)}
              stackscript={stackscript}
            />
          ))}
          {error && <TableRowError colSpan={3} message={error[0].reason} />}
          {isLoading && <TableRowLoading columns={3} rows={25} />}
          {isFetchingNextPage && <TableRowLoading columns={3} rows={1} />}
          {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
        </TableBody>
      </Table>
    </Box>
  );
};
