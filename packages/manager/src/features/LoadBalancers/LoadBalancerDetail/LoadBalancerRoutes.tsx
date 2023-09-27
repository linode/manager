import CloseIcon from '@mui/icons-material/Close';
import { Hidden, IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import {
  CollapsibleTable,
  TableItem,
} from 'src/components/CollapsibleTable/CollapsibleTable';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { InputAdornment } from 'src/components/InputAdornment';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { TextField } from 'src/components/TextField';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLoadBalancerRoutesQuery } from 'src/queries/aglb/routes';

import { RulesTable } from './RulesTable';

import type { Filter } from '@linode/api-v4';

const PREFERENCE_KEY = 'loadbalancer-routes';

export const LoadBalancerRoutes = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const [query, setQuery] = useState<string>();

  const pagination = usePagination(1, PREFERENCE_KEY);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${PREFERENCE_KEY}-order`
  );

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  // If the user types in a search query, API filter by the label.
  if (query) {
    filter['label'] = { '+contains': query };
  }

  const { data: routes, isLoading } = useLoadBalancerRoutesQuery(
    Number(loadbalancerId),
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  const getTableItems = (): TableItem[] => {
    if (!routes) {
      return [];
    }
    return routes.data?.map(({ id, label, protocol, rules }) => {
      const OuterTableCells = (
        <>
          <Hidden smDown>
            <TableCell>{rules?.length}</TableCell>
          </Hidden>
          <Hidden smDown>
            <TableCell>{protocol?.toLocaleUpperCase()}</TableCell>{' '}
          </Hidden>
          <TableCell actionCell>
            {/**
             * TODO: AGLB: The Add Rule behavior should be implemented in future AGLB tickets.
             */}
            <InlineMenuAction actionText="Add Rule" onClick={() => null} />
            {/**
             * TODO: AGLB: The Action menu behavior should be implemented in future AGLB tickets.
             */}
            <ActionMenu
              actionsList={[
                { onClick: () => null, title: 'Edit' },
                { onClick: () => null, title: 'Clone Route' },
                { onClick: () => null, title: 'Delete' },
              ]}
              ariaLabel={`Action Menu for Route ${label}`}
            />
          </TableCell>
        </>
      );

      const InnerTable = <RulesTable rules={rules} />;

      return {
        InnerTable,
        OuterTableCells,
        id,
        label,
      };
    });
  };

  const RoutesTableRowHead = (
    <TableRow>
      <TableSortCell
        active={orderBy === 'label'}
        direction={order}
        handleClick={handleOrderChange}
        label="label"
      >
        Route Label
      </TableSortCell>
      <Hidden smDown>
        <TableCell>Rules</TableCell>
      </Hidden>
      <Hidden smDown>
        <TableSortCell
          active={orderBy === 'protocol'}
          direction={order}
          handleClick={handleOrderChange}
          label="protocol"
        >
          Protocol
        </TableSortCell>
      </Hidden>
      <TableCell></TableCell>
    </TableRow>
  );

  return (
    <>
      <Stack
        alignItems="flex-end"
        direction="row"
        flexWrap="wrap"
        gap={2}
        mb={2}
        mt={1.5}
      >
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear"
                  onClick={() => setQuery('')}
                  size="small"
                  sx={{ padding: 'unset' }}
                >
                  <CloseIcon
                    color="inherit"
                    sx={{ color: '#aaa !important' }}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
          hideLabel
          label="Filter"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          style={{ minWidth: '320px' }}
          value={query}
        />
        <Box flexGrow={1} />
        {/**
         * TODO: AGLB: The Create Route behavior should be implemented in future AGLB tickets.
         */}
        <Button buttonType="primary">Create Route</Button>
      </Stack>
      <CollapsibleTable
        TableItems={getTableItems()}
        TableRowEmpty={<TableRowEmpty colSpan={5} message={'No Routes'} />}
        TableRowHead={RoutesTableRowHead}
      />
      <PaginationFooter
        count={routes?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};
