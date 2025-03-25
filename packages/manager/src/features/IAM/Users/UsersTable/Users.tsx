import { getAPIFilterFromQuery } from '@linode/search';
import { Box, Button, Paper, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers, useProfile } from '@linode/queries';

import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import { CreateUserDrawer } from './CreateUserDrawer';
import { ProxyUserTable } from './ProxyUserTable';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { Filter } from '@linode/api-v4';

const XS_TO_SM_BREAKPOINT = 475;

export const UsersLanding = () => {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');

  const { data: profile } = useProfile();
  const theme = useTheme();
  const pagination = usePagination(1, 'account-users');
  const order = useOrder();

  const location = useLocation();
  const history = useHistory();

  const isProxyUser =
    profile?.user_type === 'child' || profile?.user_type === 'proxy';

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query') ?? '';

  const { error: searchError, filter } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['username', 'email'],
  });

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
    ...filter,
  };

  // Since this query is disabled for restricted users, use isLoading.
  const { data: users, error, isFetching, isLoading } = useAccountUsers({
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
    history.push({ search: queryParams.toString() });
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
      <Paper sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <Box
          sx={(theme) => ({
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(2),
            [theme.breakpoints.down(XS_TO_SM_BREAKPOINT)]: {
              alignItems: 'flex-start',
              flexDirection: 'column',
            },
          })}
        >
          {isProxyUser ? (
            <Typography
              sx={(theme) => ({
                [theme.breakpoints.down('md')]: {
                  marginLeft: theme.spacing(1),
                },
              })}
              variant="h3"
            >
              User Settings
            </Typography>
          ) : (
            <DebouncedSearchTextField
              containerProps={{
                sx: {
                  width: { md: '320px', xs: '100%' },
                },
              }}
              clearable
              debounceTime={250}
              errorText={searchError?.message}
              hideLabel
              isSearching={isFetching}
              label="Filter"
              onSearch={handleSearch}
              placeholder="Filter"
              value={query}
            />
          )}
          <Button
            sx={(theme) => ({
              [theme.breakpoints.down(XS_TO_SM_BREAKPOINT)]: {
                marginTop: theme.spacing(1),
                width: '100%',
              },
            })}
            tooltipText={
              isRestrictedUser
                ? 'You cannot create other users as a restricted user.'
                : undefined
            }
            buttonType="primary"
            disabled={isRestrictedUser}
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            Add a User
          </Button>
        </Box>
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
