import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/account/users';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';

import type { Filter } from '@linode/api-v4';
import { Box, Button, Paper } from '@linode/ui';
import { UsersLandingTableHead } from './UsersLandingTableHead';
import { UsersLandingTableBody } from './UsersLandingTableBody';

export const UsersLanding = () => {
  const pagination = usePagination(1, 'account-users');
  const order = useOrder();

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
  };

  // Since this query is disabled for restricted users, use isLoading.
  const { data: users, error, isLoading } = useAccountUsers({
    filters: usersFilter,
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
  });

  const numCols = 4;

  const handleDelete = (username: string) => {
    // mock
  };

  const handleSearch = async (value: string) => {
    // mock
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users & Grants" />
      <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <Box
          sx={(theme) => ({
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(2),
          })}
        >
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            hideLabel
            label="Filter"
            onSearch={handleSearch}
            placeholder="Filter"
            value=""
            sx={{ width: 320 }}
          />
          <Button buttonType="primary">Add a User</Button>
        </Box>
        <Table aria-label="List of Users">
          <UsersLandingTableHead order={order} />
          <TableBody>
            <UsersLandingTableBody
              error={error}
              isLoading={isLoading}
              numCols={numCols}
              onDelete={handleDelete}
              users={users?.data}
            />
          </TableBody>
        </Table>
        <PaginationFooter
          count={users?.results || 0}
          eventCategory="users landing"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </Paper>
    </React.Fragment>
  );
};
