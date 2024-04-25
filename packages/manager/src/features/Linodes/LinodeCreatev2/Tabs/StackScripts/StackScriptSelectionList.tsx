import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Waypoint } from 'react-waypoint';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import {
  useStackScriptQuery,
  useStackScriptsInfiniteQuery,
} from 'src/queries/stackscripts';

import { useLinodeCreateQueryParams } from '../../utilities';
import { StackScriptDetailsDialog } from './StackScriptDetailsDialog';
import { StackScriptSelectionRow } from './StackScriptSelectionRow';
import { getDefaultUDFData } from './UserDefinedFields/utilities';
import {
  accountStackScriptFilter,
  communityStackScriptFilter,
} from './utilities';

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

  const { control, setValue } = useFormContext<CreateLinodeRequest>();

  const { field } = useController({
    control,
    name: 'stackscript_id',
  });

  const [selectedStackScriptId, setSelectedStackScriptId] = useState<number>();

  const { params, updateParams } = useLinodeCreateQueryParams();

  const hasPreselectedStackScript = Boolean(params.stackScriptID);

  const { data: stackscript } = useStackScriptQuery(
    params.stackScriptID ?? -1,
    hasPreselectedStackScript
  );

  const filter =
    type === 'Community'
      ? communityStackScriptFilter
      : accountStackScriptFilter;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useStackScriptsInfiniteQuery(
    {
      ['+order']: order,
      ['+order_by']: orderBy,
      ...filter,
    },
    !hasPreselectedStackScript
  );

  const stackscripts = data?.pages.flatMap((page) => page.data);

  if (hasPreselectedStackScript) {
    return (
      <Stack spacing={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 20 }}></TableCell>
              <TableCell>StackScript</TableCell>
              <TableCell sx={{ minWidth: 120 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stackscript && (
              <StackScriptSelectionRow
                disabled
                isSelected={field.value === stackscript.id}
                onOpenDetails={() => setSelectedStackScriptId(stackscript.id)}
                stackscript={stackscript}
              />
            )}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="flex-end">
          <Button
            onClick={() => {
              field.onChange(null);
              setValue('image', null);
              updateParams({ stackScriptID: undefined });
            }}
          >
            Choose Another StackScript
          </Button>
        </Box>
      </Stack>
    );
  }

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
              onSelect={() => {
                setValue('image', null);
                setValue(
                  'stackscript_data',
                  getDefaultUDFData(stackscript.user_defined_fields)
                );
                field.onChange(stackscript.id);
              }}
              isSelected={field.value === stackscript.id}
              key={stackscript.id}
              onOpenDetails={() => setSelectedStackScriptId(stackscript.id)}
              stackscript={stackscript}
            />
          ))}
          {error && <TableRowError colSpan={3} message={error[0].reason} />}
          {isLoading && <TableRowLoading columns={3} rows={25} />}
          {(isFetchingNextPage || hasNextPage) && (
            <TableRowLoading columns={3} rows={1} />
          )}
        </TableBody>
      </Table>
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      <StackScriptDetailsDialog
        id={selectedStackScriptId}
        onClose={() => setSelectedStackScriptId(undefined)}
        open={selectedStackScriptId !== undefined}
      />
    </Box>
  );
};
