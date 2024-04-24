import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodesQuery } from 'src/queries/linodes/linodes';

import { LinodeSelectTableRow } from './LinodeSelectTableRow';

import type { Theme } from '@mui/material';

export const LinodeSelectTable = () => {
  const matchesMdUp = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('md')
  );

  const [query, setQuery] = useState('');
  const pagination = usePagination();
  const order = useOrder();

  const filter = {
    '+or': [{ label: { '+contains': query } }],
    '+order': order.order,
    '+order_by': order.orderBy,
    // backups: { enabled: true }, womp womp, we can't filter on keys of objects
  };

  const { data: linodes, error, isLoading, isFetching } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  return (
    <Stack pt={1} spacing={2}>
      <DebouncedSearchTextField
        clearable
        hideLabel
        isSearching={isFetching}
        label="Search"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        value={query}
      />
      {matchesMdUp ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableSortCell
                active={order.orderBy === 'label'}
                direction={order.order}
                handleClick={order.handleOrderChange}
                label="label"
              >
                Linode
              </TableSortCell>
              <TableCell>Status</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Plan</TableCell>
              <TableSortCell
                active={order.orderBy === 'region'}
                direction={order.order}
                handleClick={order.handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linodes?.data.map((linode) => (
              <LinodeSelectTableRow key={linode.id} linode={linode} />
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Stack>
  );
};
