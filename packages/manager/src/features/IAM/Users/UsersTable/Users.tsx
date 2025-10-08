import { useAccountUsers, useProfile } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { Button, Paper, Select } from '@linode/ui';
import { Grid, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { useIsIAMDelegationEnabled } from '../../hooks/useIsIAMEnabled';
import { usePermissions } from '../../hooks/usePermissions';
import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import { CreateUserDrawer } from './CreateUserDrawer';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { Filter } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

const ALL_USERS_OPTION: SelectOption = {
  label: 'All User Types',
  value: 'all',
};

export const UsersLanding = () => {
  const navigate = useNavigate();
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { data: profile } = useProfile();

  const { query } = useSearch({
    from: '/iam',
  });
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] =
    React.useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');
  const theme = useTheme();
  const { data: permissions } = usePermissions('account', ['create_user']);
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

  const queryParams = new URLSearchParams(location.search);

  const { error: searchError, filter } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['username', 'email'],
  });

  // Determine if the current user is a child account with isIAMDelegationEnabled enabled
  // If so, we need to show both 'child' and 'delegate_user' users in the table
  const isChildWithDelegationEnabled =
    isIAMDelegationEnabled && Boolean(profile?.user_type === 'child');

  const [userType, setUserType] = React.useState<null | SelectOption>(
    ALL_USERS_OPTION
  );

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

  const filteredUsers = React.useMemo(() => {
    if (!userType || userType.value === 'all') return users?.data;
    // Map UI select value to API user_type value
    let apiUserType: string | undefined;
    if (userType.value === 'users') {
      apiUserType = 'child';
    } else {
      apiUserType = 'delegate';
    }
    return users?.data.filter((user) => user.user_type === apiUserType);
  }, [users, userType]);

  const filterableOptions = [
    ALL_USERS_OPTION,
    {
      label: 'Users',
      value: 'users',
    },
    {
      label: 'Delegate Users',
      value: 'delegate',
    },
  ];

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
      search: {
        users: queryParams.get('users') ?? 'all',
        query: value,
      },
    });
  };

  const handleDelete = (username: string) => {
    setIsDeleteDialogOpen(true);
    setSelectedUsername(username);
  };

  const canCreateUser = permissions.create_user;

  return (
    <React.Fragment>
      <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
        <Grid
          container
          direction="row"
          rowSpacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.tokens.spacing.S12,
          }}
        >
          <Grid container direction="row" rowSpacing={1}>
            <DebouncedSearchTextField
              clearable
              containerProps={{
                sx: {
                  width: '320px',
                  marginRight: { md: 2, xs: 2 },
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
            {isChildWithDelegationEnabled && (
              <Select
                hideLabel
                label="Select type"
                onChange={(_, selected) => {
                  pagination.handlePageChange(1);
                  setUserType(selected ?? null);
                  navigate({
                    to: '/iam/users',
                    search: {
                      users: String(selected?.value ?? 'all'),
                      query: queryParams.get('query') ?? '',
                    },
                  });
                }}
                options={filterableOptions}
                placeholder="All User Types"
                sx={{ minWidth: 250 }}
                value={userType}
              />
            )}
          </Grid>
          <Grid sx={{ alignSelf: 'flex-start' }}>
            <Button
              buttonType="primary"
              disabled={!canCreateUser}
              onClick={() => setIsCreateDrawerOpen(true)}
              tooltipText={
                canCreateUser
                  ? 'You cannot create other users as a restricted user.'
                  : undefined
              }
            >
              Add a User
            </Button>
          </Grid>
        </Grid>
        <Table aria-label="List of Users" sx={{ tableLayout: 'fixed' }}>
          <UsersLandingTableHead order={order} />
          <TableBody>
            <UsersLandingTableBody
              error={error}
              isLoading={isLoading}
              numCols={numCols}
              onDelete={handleDelete}
              users={filteredUsers ?? []}
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
