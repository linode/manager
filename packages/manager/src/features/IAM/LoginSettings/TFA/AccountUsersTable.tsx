import { Pagination, Table, TableBody } from '@akamai/cds-components/react';
import { useAllAccountUsersQuery, usePreferences } from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { useAccountUsersSearch } from '../../hooks/useAccountUsersSearch';
import { useDelegationRole } from '../../hooks/useDelegationRole';
import { useOrder } from '../../hooks/useOrder';
import { usePagination } from '../../hooks/usePagination';
import { usePermissions } from '../../hooks/usePermissions';
import {
  getErrorText,
  getIsLoadingUsers,
  getLoadingLabel,
  getMatchingUsers,
  getNextOptionalUsersForSelectAll,
  getTableRows,
  toUserOptions,
} from './AccountUsersTable.utilities';
import { AccountUsersTableBody } from './AccountUsersTableBody';
import { AccountUsersTableControls } from './AccountUsersTableControls';
import { AccountUsersTableHead } from './AccountUsersTableHead';
import { AccountUsersTableToolbar } from './AccountUsersTableToolbar';

import type { TfaEnforcementFormValues } from './TfaEnforcementLanding';

const MIN_PAGE_SIZE = 25;
const TFA_ENFORCEMENT_ROUTE = '/iam/settings/tfa-enforcement' as const;

interface Props {
  disabled?: boolean;
  tfaOptionalUsers: string[] | undefined;
  tfaOptionalUsersError?: unknown;
  totalUsers: number;
}

export const AccountUsersTable = ({
  totalUsers,
  tfaOptionalUsers,
  disabled,
  tfaOptionalUsersError,
}: Props) => {
  const { setValue } = useFormContext<TfaEnforcementFormValues>();
  const [showSelectedOnly, setShowSelectedOnly] = React.useState(false);
  const navigate = useNavigate();
  const { query } = useSearch({ from: TFA_ENFORCEMENT_ROUTE });

  // optionalUsers = users for whom 2FA is NOT enforced
  const [optionalUsers, setOptionalUsers] = React.useState<string[]>(
    tfaOptionalUsers ?? []
  );
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState<'selected' | 'unselected'>(
    'unselected'
  );
  // Frozen snapshot of optional usernames used for sorting.
  // Updated when the Select changes or when Refresh is clicked.
  // Row toggles do NOT update this, so the order stays stable until explicitly refreshed.
  const [sortSnapshot, setSortSnapshot] = React.useState<Set<string>>(
    () => new Set(tfaOptionalUsers ?? [])
  );
  const [hasEngagedFullList, setHasEngagedFullList] = React.useState(false);
  const [pendingBulkAction, setPendingBulkAction] = React.useState<
    'clear' | 'select' | null
  >(null);

  // Filter out delegate users from the users if user is a child or delegate user.
  const { isChildUserType, isDelegateUserType } = useDelegationRole();

  const isChildOrDelegate = isChildUserType || isDelegateUserType;
  const { data: permissions } = usePermissions('account', ['view_user']);

  const order = useOrder({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'username',
      },
      from: '/iam/settings/tfa-enforcement',
    },
    preferenceKey: 'iam-tfa-enforcement-account-users-order',
  });

  const extraFilter = React.useMemo(
    () => (isChildOrDelegate ? { user_type: 'child' } : undefined),
    [isChildOrDelegate]
  );
  const canFetchUsers = Boolean(permissions?.view_user);

  const { isPending: isPageSizePreferencePending } = usePreferences(
    (preferences) => preferences?.pageSizes
  );

  const pagination = usePagination({
    currentRoute: TFA_ENFORCEMENT_ROUTE,
    defaultPageSize: MIN_PAGE_SIZE,
    preferenceKey: 'iam-tfa-enforcement-users',
  });

  const canFetchPaginatedUsers = canFetchUsers && !isPageSizePreferencePending;

  // Same unfiltered getAll as TfaEnforcementLanding (`{}`) so React Query
  // dedupes. First page still comes from the paginated query for a fast paint.
  const {
    data: allUsers,
    error: allUsersError,
    isFetching: isFetchingAllUsers,
    isLoading: isLoadingAllUsers,
  } = useAllAccountUsersQuery(canFetchUsers);

  const hasAllUsers = allUsers !== undefined;

  const {
    error: paginatedError,
    isFetching: isFetchingPage,
    isLoading: isLoadingPage,
    isPendingSearch,
    total: paginatedTotal,
    users: paginatedUsers,
  } = useAccountUsersSearch({
    debounceMs: 0,
    enabled: canFetchPaginatedUsers && !hasEngagedFullList,
    extraFilter,
    mode: 'paginated',
    order: order.order,
    orderBy: order.orderBy,
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: query ?? '',
  });

  const matchingAllUsers = React.useMemo(() => {
    if (!allUsers) {
      return [];
    }

    return getMatchingUsers({
      extraFilter,
      order: order.order,
      orderBy: order.orderBy,
      query,
      users: allUsers,
    });
  }, [allUsers, extraFilter, order.order, order.orderBy, query]);

  const users = hasEngagedFullList ? matchingAllUsers : paginatedUsers;
  const usersError = hasEngagedFullList ? allUsersError : paginatedError;
  const usersDataError = tfaOptionalUsersError || usersError;

  const userOptions = React.useMemo(() => toUserOptions(users), [users]);

  // Derive the set of enforced (selected) users (all users except optionalUsers)
  const optionalUsernamesSet = React.useMemo(
    () => new Set(optionalUsers),
    [optionalUsers]
  );

  const selectedUsersSet = React.useMemo(
    () =>
      new Set(
        userOptions
          .filter((u) => !optionalUsernamesSet.has(u.value))
          .map((u) => u.value)
      ),
    [optionalUsernamesSet, userOptions]
  );

  const selectedUsers = React.useMemo(
    () => userOptions.filter((u) => selectedUsersSet.has(u.value)),
    [selectedUsersSet, userOptions]
  );

  const selectedUsersCount = React.useMemo(
    () => Math.max(totalUsers - optionalUsernamesSet.size, 0),
    [optionalUsernamesSet, totalUsers]
  );

  const isLoadingUsers = getIsLoadingUsers({
    hasAllUsers,
    hasEngagedFullList,
    isFetchingAllUsers,
    isFetchingPage,
    isLoadingAllUsers,
    isLoadingPage,
    isPageSizePreferencePending,
    isPendingSearch,
    paginatedUsersCount: paginatedUsers.length,
  });

  const loadingLabel = getLoadingLabel({
    hasEngagedFullList,
    isPendingSearch,
    query,
  });

  const handleSearch = React.useCallback(
    (value: string) => {
      const nextQuery = value === '' ? undefined : String(value);

      navigate({
        search: (prev) => ({
          ...prev,
          page: 1,
          query: nextQuery,
        }),
        to: TFA_ENFORCEMENT_ROUTE,
      });
    },
    [navigate]
  );

  const { filteredRows, tableRows } = getTableRows({
    hasEngagedFullList,
    page: pagination.page,
    pageSize: pagination.pageSize,
    selectedUsers,
    showSelectedOnly,
    sortOrder,
    sortSnapshot,
    userOptions,
  });

  const scopedOptions = tableRows.map((row) => row.option);
  const matchingUsernames = matchingAllUsers.map((user) => user.username);

  const selectedScopedCount = React.useMemo(
    () =>
      scopedOptions.filter((option) => selectedUsersSet.has(option.value))
        .length,
    [scopedOptions, selectedUsersSet]
  );

  const clearDisabled =
    !!usersDataError ||
    !tableRows.some((row) => selectedUsersSet.has(row.option.value));

  const hasNoResults = tableRows.length === 0 && userOptions.length === 0;
  const errorText = getErrorText(usersDataError);
  const showNoUsersText = !isLoadingUsers && !usersDataError && hasNoResults;
  const totalCount = hasEngagedFullList ? filteredRows.length : paginatedTotal;
  const matchingUsersCount = hasEngagedFullList
    ? userOptions.length
    : paginatedTotal;
  const filteredUsersCount = usersDataError ? 0 : matchingUsersCount;

  const applyOptionalUsersUpdate = (next: string[]) => {
    setOptionalUsers(next);
    setValue('tfaOptionalUsers', next, { shouldDirty: true });
    setHasInteracted(true);
  };

  const applyBulkAction = (
    action: 'clear' | 'select',
    scopedValues: string[]
  ) => {
    if (action === 'clear') {
      const visibleSelectedValues = scopedValues.filter(
        (value) => !optionalUsernamesSet.has(value)
      );
      const next = [...optionalUsers, ...visibleSelectedValues];
      applyOptionalUsersUpdate(next);
      const newOptionalSet = new Set(next);
      const remainingSelected = userOptions.filter(
        (u) => !newOptionalSet.has(u.value)
      ).length;
      setShowSelectedOnly(remainingSelected > 0 ? showSelectedOnly : false);
      return;
    }

    const allSelected =
      scopedValues.length > 0 &&
      scopedValues.every((value) => selectedUsersSet.has(value));
    applyOptionalUsersUpdate(
      getNextOptionalUsersForSelectAll({
        allSelected,
        optionalUsernamesSet,
        optionalUsers,
        scopedValues,
      })
    );
  };

  React.useEffect(() => {
    if (pendingBulkAction === null || !hasAllUsers) {
      return;
    }

    applyBulkAction(pendingBulkAction, matchingUsernames);
    setPendingBulkAction(null);
    // applyBulkAction closes over the latest selection state for this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAllUsers, matchingUsernames, pendingBulkAction]);

  const handleClear = () => {
    setHasEngagedFullList(true);
    if (!hasAllUsers) {
      setPendingBulkAction('clear');
      return;
    }
    applyBulkAction('clear', matchingUsernames);
  };

  const handleSelectAll = () => {
    setHasEngagedFullList(true);
    if (!hasAllUsers) {
      setPendingBulkAction('select');
      return;
    }
    applyBulkAction('select', matchingUsernames);
  };

  const handleToggle = (value: string, checked: boolean) => {
    // checked = enforce (select) - remove from optional
    // unchecked = make optional - add to optional
    const next = checked
      ? optionalUsers.filter((v) => v !== value)
      : [...optionalUsers, value];
    applyOptionalUsersUpdate(next);
  };

  return (
    <div>
      <AccountUsersTableToolbar
        hasInteracted={hasInteracted}
        isLoading={isLoadingUsers}
        onRefreshSorting={() => {
          setHasEngagedFullList(true);
          setSortSnapshot(new Set(optionalUsernamesSet));
          setHasInteracted(false);
        }}
        onSearch={handleSearch}
        onSortOrderChange={(value) => {
          setHasEngagedFullList(true);
          setSortOrder(value);
          setSortSnapshot(new Set(optionalUsernamesSet));
          setHasInteracted(false);
        }}
        query={query ?? ''}
        scopedOptionsLength={scopedOptions.length}
        sortOrder={sortOrder}
      />

      <AccountUsersTableControls
        clearDisabled={clearDisabled}
        disabled={disabled}
        filteredUsersCount={filteredUsersCount}
        onClear={handleClear}
        onSelectAll={handleSelectAll}
        scopedOptionsLength={usersDataError ? 0 : scopedOptions.length}
        selectedScopedCount={usersDataError ? 0 : selectedScopedCount}
        selectedUsersCount={usersDataError ? 0 : selectedUsersCount}
      />

      <div>
        <Table
          aria-label="List of Account Users"
          style={{
            borderTop: `1px solid var(--token-component-pagination-border, light-dark(#d6d6dd, #515157))`,
          }}
        >
          <AccountUsersTableHead
            disabled={disabled}
            onSelectAll={handleSelectAll}
            order={order}
            scopedOptionsLength={usersDataError ? 0 : scopedOptions.length}
            selectedScopedCount={usersDataError ? 0 : selectedScopedCount}
          />
          <TableBody>
            <AccountUsersTableBody
              disabled={disabled}
              errorText={errorText}
              isLoading={isLoadingUsers}
              loadingLabel={loadingLabel}
              onToggle={handleToggle}
              selectedUsersSet={selectedUsersSet}
              showNoUsersText={showNoUsersText}
              tableRows={tableRows}
            />
          </TableBody>
        </Table>

        <Pagination
          count={totalCount}
          itemsLabel="Users"
          onPageChange={(e: CustomEvent<number>) =>
            pagination.handlePageChange(Number(e.detail))
          }
          onPageSizeChange={(
            e: CustomEvent<{ page: number; pageSize: number }>
          ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={[MIN_PAGE_SIZE, 50, 75]}
          style={{ borderTop: 0, borderBottom: 0 }}
        />
      </div>
    </div>
  );
};
