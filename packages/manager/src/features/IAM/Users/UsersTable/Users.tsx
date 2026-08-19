import {
  Button,
  FormError,
  FormField,
  FormLabel,
  Icon,
  Pagination,
  Select,
  Table,
  TableBody,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useAccountUsers } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { useOrder } from '../../hooks/useOrder';
import { usePagination } from '../../hooks/usePagination';
import { usePermissions } from '../../hooks/usePermissions';
import { Box } from '../../Shared/Box/Box';
import {
  IAM_CHILD_USERS_PENDO_IDS,
  IAM_DELEGATE_USERS_PENDO_IDS,
  IAM_PARENT_USERS_PENDO_IDS,
} from '../../Shared/constants';
import { DebouncedSearchField } from '../../Shared/DebouncedSearchField/DebouncedSearchField';
import globalStyles from '../../Shared/global.module.css';
import { Paper } from '../../Shared/Paper/Paper';
import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import { CreateUserDrawer } from './CreateUserDrawer';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { IAMAction } from '../../routes';
import type { SelectOption } from '../../Shared/types';
import type { Filter } from '@linode/api-v4';

const ALL_USERS_OPTION: SelectOption = {
  label: 'All User Types',
  value: 'all',
};

const MIN_PAGE_SIZE = 25;

export const UsersLanding = () => {
  const navigate = useNavigate();

  const { isChildUserType, isDelegateUserType } = useDelegationRole();

  const {
    action,
    query,
    username: selectedUsername,
    users: usersParam,
  } = useSearch({
    from: '/iam/users',
  });
  const { data: permissions } = usePermissions('account', [
    'create_user',
    'view_user',
  ]);
  const pagination = usePagination({
    currentRoute: '/iam/users',
    initialPage: 1,
    preferenceKey: 'iam-account-users-pagination',
  });
  const order = useOrder({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'username',
      },
      from: '/iam/users',
    },
    preferenceKey: 'iam-account-users-order',
  });

  const { error: searchError, filter } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['username', 'email'],
  });

  // Determine if the current user is a child or delegate profile
  // If so, we need to show both 'child' and 'delegate_user' users in the table
  const isChildOrDelegate = isChildUserType || isDelegateUserType;

  const filterableOptions = React.useMemo(
    () => [
      ALL_USERS_OPTION,
      {
        label: 'Users',
        value: 'users',
      },
      {
        label: 'Delegate Users',
        value: 'delegate',
      },
    ],
    []
  );

  // Initialize userType based on URL parameter
  const getInitialUserType = React.useMemo(() => {
    if (!usersParam || usersParam === 'all') {
      return ALL_USERS_OPTION;
    }
    return (
      filterableOptions.find((option) => option.value === usersParam) ||
      ALL_USERS_OPTION
    );
  }, [usersParam, filterableOptions]);

  const [userType, setUserType] = React.useState<null | SelectOption>(
    getInitialUserType
  );

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
    ...filter,
    ...(isChildOrDelegate && userType && userType.value !== 'all'
      ? {
          user_type: userType.value === 'users' ? 'child' : 'delegate',
        }
      : {}),
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

  const handleSearch = React.useCallback(
    (value: string) => {
      const nextQuery = value === '' ? undefined : String(value);
      navigate({
        to: '/iam/users',
        search: (prev) => ({
          ...prev,
          query: nextQuery,
          page: 1,
        }),
      });
    },
    [navigate]
  );

  const actionHandler = (action: IAMAction, username?: string) => {
    navigate({
      to: '/iam/users',
      search: (prev) => ({
        ...prev,
        action,
        username,
      }),
    });
  };

  const handleAddUser = () => {
    actionHandler('add-user');
  };

  const clearDialogAction = (expectedAction?: IAMAction) => {
    // Both overlays share the same `action` search param. Guard ensures a close
    // event from one overlay cannot wipe the other's URL state.
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: '/iam/users',
      search: (prev) => ({
        ...prev,
        action: undefined,
      }),
    });
  };

  const clearDialogParams = () => {
    navigate({
      to: '/iam/users',
      search: (prev) => ({
        ...prev,
        username: undefined,
      }),
    });
  };

  const handleDelete = (username: string) => {
    actionHandler('delete-user', username);
  };

  const handleDeleteDialogClose = () => {
    const removedLastOnPage =
      users && users?.data.length % pagination.pageSize === 1;

    if (removedLastOnPage) {
      pagination.handlePageChange(pagination.page - 1);
    }

    clearDialogAction('delete-user');
  };

  const canCreateUser = permissions.create_user;

  return (
    <React.Fragment>
      <Paper>
        <Box
          direction="row"
          spacing={1}
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.S12,
          }}
        >
          <Box direction="row" spacing={2}>
            <FormField
              error={Boolean(searchError?.message)}
              labelPosition="top"
              style={{ padding: 0, marginRight: Spacing.S16 }}
            >
              <FormLabel
                className={globalStyles.visuallyHidden}
                htmlFor="filter-users"
                slot="label"
              >
                Filter Users
              </FormLabel>
              <DebouncedSearchField
                disabled={!permissions?.view_user}
                id="filter-users"
                onSearch={handleSearch}
                placeholder="Filter"
                value={query ?? ''}
              />
              <FormError slot="error">{searchError?.message}</FormError>
            </FormField>
            {isChildOrDelegate && (
              <Select
                disabled={!permissions?.view_user}
                items={filterableOptions}
                onChange={(event) => {
                  const nextSelected =
                    event.detail as unknown as null | SelectOption;

                  pagination.handlePageChange(1);
                  setUserType(nextSelected ?? null);
                  navigate({
                    to: '/iam/users',
                    search: (prev) => ({
                      ...prev,
                      users: String(nextSelected?.value ?? 'all'),
                    }),
                  });
                }}
                placeholder="All User Types"
                selected={userType}
                style={{ minWidth: 250 }}
                valueFn={(item) => (item as SelectOption).label}
              />
            )}
          </Box>
          <Tooltip
            disabled={canCreateUser}
            tooltipPlacement="bottom"
            tooltipText="You do not have permission to create other users."
          >
            <Button
              data-pendo-id={
                isDelegateUserType
                  ? IAM_DELEGATE_USERS_PENDO_IDS.addUserButton
                  : isChildUserType
                    ? IAM_CHILD_USERS_PENDO_IDS.addUserButton
                    : IAM_PARENT_USERS_PENDO_IDS.addUserButton
              }
              disabled={!canCreateUser}
              onClick={handleAddUser}
              variant="primary"
            >
              Add a User
              {!canCreateUser && <Icon icon="info-outline" size="m" />}
            </Button>
          </Tooltip>
        </Box>
        <Table aria-label="List of Users">
          <UsersLandingTableHead order={order} />
          <TableBody>
            <UsersLandingTableBody
              error={error}
              isLoading={isLoading || isFetching}
              onDelete={handleDelete}
              users={users?.data ?? []}
            />
          </TableBody>
        </Table>
        {users?.results && users.results > MIN_PAGE_SIZE ? (
          <Pagination
            count={users?.results ?? 0}
            onPageChange={(e: CustomEvent<number>) =>
              pagination.handlePageChange(Number(e.detail))
            }
            onPageSizeChange={(
              e: CustomEvent<{ page: number; pageSize: number }>
            ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
            page={pagination.page}
            pageSize={pagination.pageSize}
            pageSizes={[MIN_PAGE_SIZE, 50, 75, 100]}
            style={{ borderBottom: 0 }}
          />
        ) : null}
      </Paper>
      <CreateUserDrawer
        onClose={() => clearDialogAction('add-user')}
        open={action === 'add-user'}
      />
      <UserDeleteConfirmation
        onClose={handleDeleteDialogClose}
        onExited={clearDialogParams}
        open={action === 'delete-user'}
        username={selectedUsername ?? ''}
      />
    </React.Fragment>
  );
};
