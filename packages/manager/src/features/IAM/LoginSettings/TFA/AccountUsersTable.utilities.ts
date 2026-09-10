import type { User } from '@linode/api-v4';

type UserOption = ReturnType<typeof toUserOptions>[number];

/**
 * Returns a user-friendly error message based on the provided error object.
 */
export const getErrorText = (usersErr: unknown): string | undefined => {
  if (!usersErr) {
    return undefined;
  }

  if (Array.isArray(usersErr)) {
    return usersErr[0]?.reason ?? 'Failed to load account users';
  }

  return (
    (usersErr as { reason?: string }).reason ?? 'Failed to load account users'
  );
};

/**
 * Returns a loading label based on the current state of the user list.
 */
export const getLoadingLabel = ({
  hasEngagedFullList,
  isPendingSearch,
  query,
}: {
  hasEngagedFullList: boolean;
  isPendingSearch: boolean;
  query?: string;
}) => {
  if (hasEngagedFullList) {
    return 'Fetching all users...';
  }

  if (isPendingSearch || (query ?? '').trim().length > 0) {
    return 'Searching users...';
  }

  return 'Fetching users...';
};

/**
 * Converts an array of User objects into an array of user options suitable for selection components.
 */
export const toUserOptions = (users: User[]) =>
  users.map((user) => ({
    email: user.email,
    label: user.username,
    value: user.username,
  }));

export const getIsLoadingUsers = ({
  hasAllUsers,
  hasEngagedFullList,
  isFetchingAllUsers,
  isFetchingPage,
  isLoadingAllUsers,
  isLoadingPage,
  isPageSizePreferencePending,
  isPendingSearch,
  paginatedUsersCount,
}: {
  hasAllUsers: boolean;
  hasEngagedFullList: boolean;
  isFetchingAllUsers: boolean;
  isFetchingPage: boolean;
  isLoadingAllUsers: boolean;
  isLoadingPage: boolean;
  isPageSizePreferencePending: boolean;
  isPendingSearch: boolean;
  paginatedUsersCount: number;
}) => {
  if (hasEngagedFullList) {
    return !hasAllUsers && (isLoadingAllUsers || isFetchingAllUsers);
  }

  if (isPageSizePreferencePending) {
    return true;
  }

  if (paginatedUsersCount > 0) {
    return false;
  }

  return isPendingSearch || isLoadingPage || isFetchingPage;
};

/**
 * Returns a sortable value for a given user based on the specified orderBy field.
 */
export const getSortableUserValue = (user: User, orderBy: string) => {
  if (orderBy === 'email') {
    return user.email ?? '';
  }

  return user.username ?? '';
};

/**
 * Filters and sorts the list of users based on the provided criteria.
 */
export const getMatchingUsers = ({
  extraFilter,
  order,
  orderBy,
  query,
  users,
}: {
  extraFilter?: { user_type?: string };
  order: 'asc' | 'desc';
  orderBy: string;
  query?: string;
  users: User[];
}) => {
  const search = query?.trim().toLowerCase();
  const userType = extraFilter?.user_type;

  const matchingUsers = users.filter((user) => {
    if (userType && user.user_type !== userType) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  return [...matchingUsers].sort((a, b) => {
    const aValue = getSortableUserValue(a, orderBy);
    const bValue = getSortableUserValue(b, orderBy);
    const comparison = aValue.localeCompare(bValue);
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Determines the next set of optional users when the "Select All" action is triggered.
 */
export const getNextOptionalUsersForSelectAll = ({
  allSelected,
  optionalUsernamesSet,
  optionalUsers,
  scopedValues,
}: {
  allSelected: boolean;
  optionalUsernamesSet: Set<string>;
  optionalUsers: string[];
  scopedValues: string[];
}) => {
  if (allSelected) {
    const newlyOptional = scopedValues.filter(
      (value) => !optionalUsernamesSet.has(value)
    );
    return [...optionalUsers, ...newlyOptional];
  }

  const scopedSet = new Set(scopedValues);
  return optionalUsers.filter((value) => !scopedSet.has(value));
};

/**
 * Generates the table rows for display, applying sorting and pagination as needed.
 */
export const getTableRows = ({
  hasEngagedFullList,
  page,
  pageSize,
  selectedUsers,
  showSelectedOnly,
  sortOrder,
  sortSnapshot,
  userOptions,
}: {
  hasEngagedFullList: boolean;
  page: number;
  pageSize: number;
  selectedUsers: UserOption[];
  showSelectedOnly: boolean;
  sortOrder: 'selected' | 'unselected';
  sortSnapshot: Set<string>;
  userOptions: UserOption[];
}) => {
  const source = showSelectedOnly ? selectedUsers : userOptions;
  const rows = source.map((option, index) => ({
    email: option.email,
    name: option.label,
    option,
    rank: index,
  }));

  const filteredRows = hasEngagedFullList
    ? [...rows].sort((a, b) => {
        const aSelected = !sortSnapshot.has(a.option.value) ? 1 : 0;
        const bSelected = !sortSnapshot.has(b.option.value) ? 1 : 0;
        return sortOrder === 'unselected'
          ? aSelected - bSelected
          : bSelected - aSelected;
      })
    : rows;

  if (!hasEngagedFullList) {
    return { filteredRows, tableRows: filteredRows };
  }

  const start = (page - 1) * pageSize;
  return {
    filteredRows,
    tableRows: filteredRows.slice(start, start + pageSize),
  };
};

export type TableRowData = ReturnType<typeof getTableRows>['tableRows'][number];
