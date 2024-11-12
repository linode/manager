import { Box, Button, Paper, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { action } from '@storybook/addon-actions';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/account/users';
import { useProfile } from 'src/queries/profile/profile';

import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import CreateUserDrawer from './CreateUserDrawer';
import { ProxyUserTable } from './ProxyUserTable';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { Filter } from '@linode/api-v4';
import type { User } from '@linode/api-v4/src/account/types';

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

  const isProxyUser =
    profile?.user_type === 'child' || profile?.user_type === 'proxy';

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
  };

  // Since this query is disabled for restricted users, use isLoading.
  const { data: users, error, isLoading, refetch } = useAccountUsers({
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

  const handleDelete = (username: string) => {
    setIsDeleteDialogOpen(true);
    setSelectedUsername(username);
  };

  const [filteredUsers, setFilteredUsers] = React.useState<User[]>(
    users?.data ?? []
  );

  const [isSearching, setIsSearching] = React.useState(false);

  // Update filteredUsers when users.data becomes available
  React.useEffect(() => {
    if (users?.data) {
      setFilteredUsers(users.data);
    }
  }, [users?.data]);

  const handleSearch = async (value: string) => {
    setIsSearching(true);
    action('searching')(value);
    const res: User[] = await new Promise((resolve) => {
      setTimeout(() => {
        if (!value.trim()) {
          return resolve(users?.data ?? []);
        }
        // Convert the search value to lowercase to make the search case-insensitive
        const lowerCaseValue = value.toLowerCase();
        // Filter based on the 'username', 'email' or 'last_login' properties
        const filteredList = filteredUsers.filter((eachVal) => {
          const lastLogin = eachVal.last_login
            ? new Date(eachVal.last_login.login_datetime)
                .toLocaleDateString()
                .toLowerCase()
            : 'never';
          return (
            eachVal.username.toLowerCase().includes(lowerCaseValue) ||
            eachVal.email.toLowerCase().includes(lowerCaseValue) ||
            lastLogin.includes(lowerCaseValue)
          );
        });
        return resolve(filteredList);
      }, 800);
    });
    action('result')(res);
    setIsSearching(false);
    setFilteredUsers(res);
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users & Grants" />
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
          })}
        >
          {isProxyUser && (
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
          )}
          {!isProxyUser && (
            <DebouncedSearchTextField
              clearable
              debounceTime={250}
              hideLabel
              isSearching={isSearching}
              label="Filter"
              onSearch={handleSearch}
              placeholder="Filter"
              sx={{ width: 320 }}
              value=""
            />
          )}
          <Button
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
        <Table aria-label="List of Users">
          <UsersLandingTableHead order={order} />
          <TableBody>
            <UsersLandingTableBody
              error={error}
              isLoading={isLoading}
              numCols={numCols}
              onDelete={handleDelete}
              users={filteredUsers}
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
        refetch={refetch}
      />
      <UserDeleteConfirmation
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        username={selectedUsername}
      />
    </React.Fragment>
  );
};
