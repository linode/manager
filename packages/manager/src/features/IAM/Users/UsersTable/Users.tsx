import { useAccountUsers, useProfile } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { Button, Paper, Stack, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import { CreateUserDrawer } from './CreateUserDrawer';
import { ProxyUserTable } from './ProxyUserTable';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { Filter } from '@linode/api-v4';

export const UsersLanding = () => {
  const navigate = useNavigate();
  const { query } = useSearch({
    from: '/iam/users',
  });
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] =
    React.useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');

  const { data: profile } = useProfile();
  const theme = useTheme();
  const pagination = usePaginationV2({
    currentRoute: '/iam/users',
    initialPage: 1,
    preferenceKey: 'iam-account-users-pagination',
  });
  const order = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'username',
      },
      from: '/iam/users',
    },
    preferenceKey: 'iam-account-users-order',
  });

  const isProxyUser =
    profile?.user_type === 'child' || profile?.user_type === 'proxy';

  const queryParams = new URLSearchParams(location.search);

  const { error: searchError, filter } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['username', 'email'],
  });

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
    ...filter,
  };

  // Since this query is disabled for restricted users, use isLoading.
  const {
    data: users,
    error,
    isFetching,
    isLoading,
  } = useAccountUsers({
    filters: usersFilter,
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
  });

  const isRestrictedUser = profile?.restricted;

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isLgDown = useMediaQuery(theme.breakpoints.up('lg'));

  const numColsLg = isLgDown ? 4 : 3;

  const numCols = isSmDown ? 2 : numColsLg;

  const handleSearch = (value: string) => {
    queryParams.set('page', '1');
    if (value) {
      queryParams.set('query', value);
    } else {
      queryParams.delete('query');
    }
    navigate({
      to: '/iam/users',
      search: { query: value },
    });
  };

  const handleDelete = (username: string) => {
    setIsDeleteDialogOpen(true);
    setSelectedUsername(username);
  };

  return (
    <React.Fragment>
      {isProxyUser && (
        <ProxyUserTable
          handleDelete={handleDelete}
          isProxyUser={isProxyUser}
          isRestrictedUser={isRestrictedUser}
          order={order}
        />
      )}
      <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
        <Stack
          direction={isSmDown ? 'column' : 'row'}
          justifyContent="space-between"
          marginBottom={2}
          spacing={2}
        >
          {isProxyUser ? (
            <Typography
              sx={(theme) => ({
                [theme.breakpoints.down('md')]: {
                  marginLeft: theme.tokens.spacing.S8,
                },
              })}
              variant="h3"
            >
              User Settings
            </Typography>
          ) : (
            <DebouncedSearchTextField
              clearable
              containerProps={{
                sx: {
                  width: '320px',
                },
              }}
              debounceTime={250}
              errorText={searchError?.message}
              hideLabel
              isSearching={isFetching}
              label="Filter"
              onSearch={handleSearch}
              placeholder="Filter"
              value={query ?? ''}
            />
          )}
          <Button
            buttonType="primary"
            disabled={isRestrictedUser}
            onClick={() => setIsCreateDrawerOpen(true)}
            sx={{
              maxWidth: '120px',
            }}
            tooltipText={
              isRestrictedUser
                ? 'You cannot create other users as a restricted user.'
                : undefined
            }
          >
            Add a User
          </Button>
        </Stack>
        <Table aria-label="List of Users" sx={{ tableLayout: 'fixed' }}>
          <UsersLandingTableHead order={order} />
          <TableBody>
            <UsersLandingTableBody
              error={error}
              isLoading={isLoading}
              numCols={numCols}
              onDelete={handleDelete}
              users={users?.data ?? []}
            />
          </TableBody>
        </Table>
        <PaginationFooter
          count={users?.results ?? 0}
          eventCategory="users landing"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </Paper>
      <CreateUserDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
      />
      <UserDeleteConfirmation
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        username={selectedUsername}
      />
    </React.Fragment>
  );
};
