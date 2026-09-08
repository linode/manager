import { useAccountUsers, useAccountUsersInfiniteQuery } from '@linode/queries';

import { useDebouncedValue } from './useDebouncedValue';

import type { APIError, Filter, User } from '@linode/api-v4';

export interface GetAccountUsersSearchFilterOptions {
  extraFilter?: Filter;
  order?: 'asc' | 'desc';
  orderBy?: string;
  query?: null | string;
}

export interface UseAccountUsersSearchOptions {
  /**
   * Debounce delay for `search`. Defaults to the IAM search debounce (500ms).
   */
  debounceMs?: number;
  /**
   * When false, neither the infinite nor paginated users query runs.
   * Gate on permission and whether the picker is open/focused.
   */
  enabled?: boolean;
  /**
   * Extra X-Filter merged after the search filter (e.g. `{ user_type: 'child' }`).
   */
  extraFilter?: Filter;
  /**
   * `infinite` for Select/TagInput scroll-loading; `paginated` for tables.
   * @default 'infinite'
   */
  mode?: 'infinite' | 'paginated';
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface UseAccountUsersSearchResult {
  error: APIError[] | null;
  fetchNextPage: ReturnType<
    typeof useAccountUsersInfiniteQuery
  >['fetchNextPage'];
  filter: Filter;
  hasNextPage: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isPendingSearch: boolean;
  total: number;
  users: User[];
}

const getSearchFilter = (query?: null | string): Filter => {
  const value = query?.trim();
  if (!value) {
    return {};
  }

  return {
    '+or': [
      { username: { '+contains': value } },
      { email: { '+contains': value } },
    ],
  };
};

/**
 * Builds the X-Filter used by IAM user pickers and tables.
 *
 * Search is always API-side (`username` / `email` +contains). Callers should
 * not client-filter the returned users.
 *
 * Select-all that must PUT a full username list still needs
 * `useAllAccountUsersQuery(false, filter)` + refetch on click. That is an
 * accepted exception, not a substitute for this hook.
 */
export const getAccountUsersSearchFilter = ({
  extraFilter = {},
  order = 'asc',
  orderBy = 'username',
  query,
}: GetAccountUsersSearchFilterOptions): Filter => ({
  '+order': order,
  '+order_by': orderBy,
  ...getSearchFilter(query),
  ...extraFilter,
});

/**
 * Shared IAM account-users search.
 *
 * - Debounces the search string
 * - Converts it to an `/account/users` X-Filter
 * - Loads either infinite pages (dropdowns) or a single page (tables)
 */
export const useAccountUsersSearch = ({
  debounceMs = 500,
  enabled = true,
  extraFilter,
  mode = 'infinite',
  order = 'asc',
  orderBy = 'username',
  page = 1,
  pageSize = 25,
  search = '',
}: UseAccountUsersSearchOptions = {}): UseAccountUsersSearchResult => {
  const debouncedSearch = useDebouncedValue(search, debounceMs);
  const isPendingSearch = search !== debouncedSearch;

  const filter = getAccountUsersSearchFilter({
    extraFilter,
    order,
    orderBy,
    query: debouncedSearch,
  });

  const isInfinite = mode === 'infinite';

  const infiniteQuery = useAccountUsersInfiniteQuery(
    filter,
    enabled && isInfinite
  );

  const paginatedQuery = useAccountUsers({
    enabled: enabled && !isInfinite,
    filters: filter,
    params: { page, page_size: pageSize },
  });

  const users = isInfinite
    ? (infiniteQuery.data?.pages.flatMap((pageData) => pageData.data) ?? [])
    : (paginatedQuery.data?.data ?? []);

  const total = isInfinite
    ? (infiniteQuery.data?.pages[0]?.results ?? 0)
    : (paginatedQuery.data?.results ?? 0);

  const activeQuery = isInfinite ? infiniteQuery : paginatedQuery;

  return {
    error: activeQuery.error ?? null,
    fetchNextPage: infiniteQuery.fetchNextPage,
    filter,
    hasNextPage: infiniteQuery.hasNextPage ?? false,
    isFetching: activeQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isLoading: activeQuery.isLoading,
    isPendingSearch,
    total,
    users,
  };
};
