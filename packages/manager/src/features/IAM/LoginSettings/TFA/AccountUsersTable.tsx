import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@akamai/cds-components/react';
import { useAllAccountUsersQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { useOrder } from '../../hooks/useOrder';
import { usePagination } from '../../hooks/usePagination';
import { usePermissions } from '../../hooks/usePermissions';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { AccountUserRow } from './AccountUserRow';
import { AccountUsersTableControls } from './AccountUsersTableControls';
import { AccountUsersTableHead } from './AccountUsersTableHead';
import { AccountUsersTableToolbar } from './AccountUsersTableToolbar';

import type { TfaEnforcementFormValues } from './TfaEnforcementLanding';
import type { Filter, User } from '@linode/api-v4';

const MIN_PAGE_SIZE = 10;

const TFA_ENFORCEMENT_ROUTE = '/iam/settings/tfa-enforcement' as const;

const getErrorText = (
  searchErr: null | SyntaxError,
  usersErr: unknown
): string | undefined =>
  searchErr?.message ??
  (usersErr
    ? ((usersErr as { reason?: string }).reason ??
      'Failed to load account users')
    : undefined);

interface Props {
  tfaOptionalUsers: string[] | undefined;
  totalUsers: number;
}

export const AccountUsersTable = ({ totalUsers, tfaOptionalUsers }: Props) => {
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

  // Filter out delegate users from the users if user is a child user.
  const { isChildUserType } = useDelegationRole();
  const { data: permissions } = usePermissions('account', ['view_user']);

  const { error: searchError, filter } = getAPIFilterFromQuery(query ?? '', {
    searchableFieldsWithoutOperator: ['username', 'email'],
  });
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

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
    ...filter,
    ...(isChildUserType
      ? {
          user_type: 'child',
        }
      : {}),
  };

  // This currently fetches all users
  const {
    data: users,
    error: usersError,
    isLoading: isUsersLoading,
  } = useAllAccountUsersQuery(permissions?.view_user, usersFilter);

  const userOptions = React.useMemo(() => {
    if (!users) {
      return [];
    }

    return users.map((user: User) => ({
      email: user.email,
      label: user.username,
      value: user.username,
    }));
  }, [users]);

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
    [userOptions, optionalUsernamesSet]
  );

  const selectedUsers = React.useMemo(
    () => userOptions.filter((u) => selectedUsersSet.has(u.value)),
    [userOptions, selectedUsersSet]
  );

  const selectedUsersCount = React.useMemo(
    () => Math.max(totalUsers - optionalUsernamesSet.size, 0),
    [optionalUsernamesSet, totalUsers]
  );

  const isLoading = isUsersLoading;

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

  const filteredRows = React.useMemo(() => {
    const source = showSelectedOnly ? selectedUsers : userOptions;

    const rows = source.map((option, index) => ({
      email: option.email,
      name: option.label,
      option,
      rank: index,
    }));

    return rows.sort((a, b) => {
      // A row is "selected" (enforced) if it is NOT in the optional snapshot.
      const aSelected = !sortSnapshot.has(a.option.value) ? 1 : 0;
      const bSelected = !sortSnapshot.has(b.option.value) ? 1 : 0;
      return sortOrder === 'unselected'
        ? aSelected - bSelected
        : bSelected - aSelected;
    });
  }, [showSelectedOnly, userOptions, selectedUsers, sortSnapshot, sortOrder]);

  const totalCount = filteredRows.length;

  const pagination = usePagination({
    currentRoute: TFA_ENFORCEMENT_ROUTE,
    defaultPageSize: MIN_PAGE_SIZE,
    preferenceKey: 'iam-tfa-enforcement-users',
    clientSidePaginationData: filteredRows,
  });

  const paginatedRows = pagination.paginatedData;

  const scopedOptions = React.useMemo(
    () => filteredRows.map((row) => row.option),
    [filteredRows]
  );

  const selectedScopedCount = React.useMemo(
    () =>
      scopedOptions.filter((option) => selectedUsersSet.has(option.value))
        .length,
    [scopedOptions, selectedUsersSet]
  );

  const clearDisabled = !filteredRows.some((row) =>
    selectedUsersSet.has(row.option.value)
  );

  const hasNoResults = paginatedRows.length === 0 && userOptions.length === 0;
  const showNoUsersText =
    !isLoading && !searchError && !usersError && hasNoResults;

  const applyOptionalUsersUpdate = (next: string[]) => {
    setOptionalUsers(next);
    setValue('tfaOptionalUsers', next, { shouldDirty: true });
    setHasInteracted(true);
  };

  const handleClear = () => {
    const visibleSelectedValues = filteredRows
      .map((row) => row.option.value)
      .filter((v) => !optionalUsernamesSet.has(v));
    const next = [...optionalUsers, ...visibleSelectedValues];
    applyOptionalUsersUpdate(next);
    const newOptionalSet = new Set(next);
    const remainingSelected = userOptions.filter(
      (u) => !newOptionalSet.has(u.value)
    ).length;
    setShowSelectedOnly(remainingSelected > 0 ? showSelectedOnly : false);
  };

  const handleSelectAll = () => {
    const allSelected =
      scopedOptions.length > 0 && selectedScopedCount >= scopedOptions.length;
    let next: string[];
    if (allSelected) {
      // Deselect all scoped (add them to optional)
      const scopedValues = scopedOptions.map((o) => o.value);
      const newlyOptional = scopedValues.filter(
        (v) => !optionalUsernamesSet.has(v)
      );
      next = [...optionalUsers, ...newlyOptional];
    } else {
      // Select all scoped (remove them from optional)
      const scopedSet = new Set(scopedOptions.map((o) => o.value));
      next = optionalUsers.filter((v) => !scopedSet.has(v));
    }
    applyOptionalUsersUpdate(next);
  };

  const handleToggle = (value: string, checked: boolean) => {
    // checked = enforce (select) - remove from optional
    // unchecked = make optional - add to optional
    const next = checked
      ? optionalUsers.filter((v) => v !== value)
      : [...optionalUsers, value];
    applyOptionalUsersUpdate(next);
  };

  const errorText = getErrorText(searchError, usersError);

  const shouldShowPagination = totalCount > MIN_PAGE_SIZE;

  return (
    <div>
      <AccountUsersTableToolbar
        hasInteracted={hasInteracted}
        isLoading={isLoading}
        onRefreshSorting={() => {
          setSortSnapshot(new Set(optionalUsernamesSet));
          setHasInteracted(false);
        }}
        onSearch={handleSearch}
        onSortOrderChange={(value) => {
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
        filteredUsersCount={userOptions.length}
        onClear={handleClear}
        onSelectAll={handleSelectAll}
        scopedOptionsLength={scopedOptions.length}
        selectedScopedCount={selectedScopedCount}
        selectedUsersCount={selectedUsersCount}
      />

      <div>
        <Table
          aria-label="List of Account Users"
          style={{
            borderTop: `1px solid var(--token-component-pagination-border, light-dark(#d6d6dd, #515157))`,
          }}
        >
          <AccountUsersTableHead
            onSelectAll={handleSelectAll}
            order={order}
            scopedOptionsLength={scopedOptions.length}
            selectedScopedCount={selectedScopedCount}
          />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  <CircleProgress />
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((p) => (
                <AccountUserRow
                  checked={selectedUsersSet.has(p.option.value)}
                  email={p.email}
                  key={p.rank}
                  onToggle={(checked) => handleToggle(p.option.value, checked)}
                  username={p.name}
                />
              ))
            )}
            {showNoUsersText && (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  <p style={{ margin: '0 auto' }}>No users found</p>
                </TableCell>
              </TableRow>
            )}
            {errorText && (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  <p style={{ margin: '0 auto' }}>{errorText}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {shouldShowPagination && (
          <Pagination
            count={totalCount}
            onPageChange={(e: CustomEvent<number>) =>
              pagination.handlePageChange(Number(e.detail))
            }
            onPageSizeChange={(
              e: CustomEvent<{ page: number; pageSize: number }>
            ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
            page={pagination.page}
            pageSize={pagination.pageSize}
            pageSizes={[MIN_PAGE_SIZE, 20, 50]}
            style={{ borderTop: 0, borderBottom: 0 }}
          />
        )}
      </div>
    </div>
  );
};
