import Grid from '@mui/material/Unstable_Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { SelectLinodeCard } from 'src/features/Linodes/LinodesCreate/SelectLinodePanel/SelectLinodeCard';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { isNumeric } from 'src/utilities/stringUtils';

import {
  LinodeCreateFormValues,
  useLinodeCreateQueryParams,
} from '../../utilities';
import { LinodeSelectTableRow } from './LinodeSelectTableRow';

import type { Theme } from '@mui/material';
import { Linode } from '@linode/api-v4';

export const LinodeSelectTable = () => {
  const matchesMdUp = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('md')
  );

  const { setValue } = useFormContext<LinodeCreateFormValues>();
  const linode = useWatch<LinodeCreateFormValues, 'linode'>({ name: 'linode' });

  const { field } = useController<LinodeCreateFormValues, 'linode'>({
    name: 'linode',
  });

  const { params } = useLinodeCreateQueryParams();

  const [preselectedLinodeId, setPreselectedLinodeId] = useState(
    params.linodeID
  );

  const [query, setQuery] = useState(linode?.label ?? '');

  const pagination = usePagination();
  const order = useOrder();

  const filter = preselectedLinodeId
    ? { id: preselectedLinodeId }
    : {
        '+or': [
          { label: { '+contains': query } },
          ...(isNumeric(query) ? [{ id: Number(query) }] : []),
        ],
        '+order': order.order,
        '+order_by': order.orderBy,
        // backups: { enabled: true }, womp womp! We can't filter on values within objects
      };

  const { data, error, isFetching, isLoading } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const handleSelect = (linode: Linode) => {
    setValue('backup_id', null);
    setValue('region', linode.region);
    if (linode.type) {
      setValue('type', linode.type);
    }
    field.onChange(linode);
  };

  return (
    <Stack pt={1} spacing={2}>
      <DebouncedSearchTextField
        customValue={{
          onChange: (value) => {
            if (!value && preselectedLinodeId) {
              setPreselectedLinodeId(undefined);
            }
            setQuery(value ?? '');
          },
          value: preselectedLinodeId ? linode?.label ?? '' : query,
        }}
        clearable
        hideLabel
        isSearching={isFetching}
        label="Search"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
      />
      {matchesMdUp ? (
        <>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && <TableRowLoading columns={5} rows={10} />}
              {error && <TableRowError colSpan={5} message={error[0].reason} />}
              {data?.results === 0 && <TableRowEmpty colSpan={5} />}
              {data?.data.map((linode) => (
                <LinodeSelectTableRow
                  key={linode.id}
                  linode={linode}
                  onSelect={() => handleSelect(linode)}
                  selected={linode.id === field.value?.id}
                />
              ))}
            </TableBody>
          </Table>
          <PaginationFooter
            count={data?.results ?? 0}
            handlePageChange={pagination.handlePageChange}
            handleSizeChange={pagination.handlePageSizeChange}
            page={pagination.page}
            pageSize={pagination.pageSize}
          />
        </>
      ) : (
        <Grid container spacing={2}>
          {data?.data.map((linode) => (
            <SelectLinodeCard
              handleSelection={() => handleSelect(linode)}
              key={linode.id}
              linode={linode}
              selected={linode.id === field.value?.id}
            />
          ))}
          {data?.results === 0 && (
            <Typography padding={1}>No results</Typography>
          )}
        </Grid>
      )}
    </Stack>
  );
};
