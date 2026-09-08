import { act, renderHook } from '@testing-library/react';

import { createUser } from '../factories';
import { wrapWithProviders } from '../utilities/testHelpers';
import {
  getAccountUsersSearchFilter,
  useAccountUsersSearch,
} from './useAccountUsersSearch';

import type { User } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useAccountUsers: vi.fn(),
  useAccountUsersInfiniteQuery: vi.fn(),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAccountUsers: queryMocks.useAccountUsers,
    useAccountUsersInfiniteQuery: queryMocks.useAccountUsersInfiniteQuery,
  };
});

const userA = createUser({ username: 'alice', email: 'alice@example.com' });
const userB = createUser({ username: 'bob', email: 'bob@example.com' });

const infiniteResult = (
  users: User[],
  extras: Record<string, unknown> = {}
) => ({
  data: {
    pages: [
      {
        data: users,
        page: 1,
        pages: 1,
        results: users.length,
      },
    ],
    pageParams: [1],
  },
  error: null,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetching: false,
  isFetchingNextPage: false,
  isLoading: false,
  ...extras,
});

const paginatedResult = (
  users: User[],
  extras: Record<string, unknown> = {}
) => ({
  data: {
    data: users,
    page: 1,
    pages: 1,
    results: users.length,
  },
  error: null,
  isFetching: false,
  isLoading: false,
  ...extras,
});

describe('getAccountUsersSearchFilter', () => {
  it('returns order defaults with no search query', () => {
    expect(getAccountUsersSearchFilter({})).toEqual({
      '+order': 'asc',
      '+order_by': 'username',
    });
  });

  it('converts a plain query into username/email +contains', () => {
    expect(getAccountUsersSearchFilter({ query: 'ali' })).toEqual({
      '+or': [
        { username: { '+contains': 'ali' } },
        { email: { '+contains': 'ali' } },
      ],
      '+order': 'asc',
      '+order_by': 'username',
    });
  });

  it('ignores whitespace-only queries', () => {
    expect(getAccountUsersSearchFilter({ query: '   ' })).toEqual({
      '+order': 'asc',
      '+order_by': 'username',
    });
  });

  it('merges extraFilter after the search filter', () => {
    expect(
      getAccountUsersSearchFilter({
        extraFilter: { user_type: 'child' },
        query: 'ali',
      })
    ).toEqual({
      '+or': [
        { username: { '+contains': 'ali' } },
        { email: { '+contains': 'ali' } },
      ],
      '+order': 'asc',
      '+order_by': 'username',
      user_type: 'child',
    });
  });
});

describe('useAccountUsersSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue(
      infiniteResult([userA, userB])
    );
    queryMocks.useAccountUsers.mockReturnValue(paginatedResult([userA]));
  });

  it('loads infinite users and flattens pages', () => {
    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      ...infiniteResult([userA]),
      data: {
        pageParams: [1, 2],
        pages: [
          { data: [userA], page: 1, pages: 2, results: 2 },
          { data: [userB], page: 2, pages: 2, results: 2 },
        ],
      },
      hasNextPage: false,
    });

    const { result } = renderHook(() => useAccountUsersSearch(), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(result.current.users).toEqual([userA, userB]);
    expect(result.current.total).toBe(2);
    expect(queryMocks.useAccountUsersInfiniteQuery).toHaveBeenCalledWith(
      {
        '+order': 'asc',
        '+order_by': 'username',
      },
      true
    );
    expect(queryMocks.useAccountUsers).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('loads a single page in paginated mode', () => {
    const { result } = renderHook(
      () =>
        useAccountUsersSearch({
          mode: 'paginated',
          page: 2,
          pageSize: 50,
        }),
      {
        wrapper: (ui) => wrapWithProviders(ui),
      }
    );

    expect(result.current.users).toEqual([userA]);
    expect(result.current.total).toBe(1);
    expect(queryMocks.useAccountUsers).toHaveBeenCalledWith({
      enabled: true,
      filters: {
        '+order': 'asc',
        '+order_by': 'username',
      },
      params: { page: 2, page_size: 50 },
    });
    expect(queryMocks.useAccountUsersInfiniteQuery).toHaveBeenCalledWith(
      expect.anything(),
      false
    );
  });

  it('does not fetch when enabled is false', () => {
    renderHook(() => useAccountUsersSearch({ enabled: false }), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(queryMocks.useAccountUsersInfiniteQuery).toHaveBeenCalledWith(
      expect.anything(),
      false
    );
    expect(queryMocks.useAccountUsers).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('applies a debounced search filter to the infinite query', () => {
    vi.useFakeTimers();

    // No wrapWithProviders: that wrapper rebuilds the router on rerender and
    // remounts the hook, which would skip debounce.
    const { rerender } = renderHook(
      ({ search }) => useAccountUsersSearch({ search }),
      { initialProps: { search: '' } }
    );

    rerender({ search: 'ali' });

    expect(queryMocks.useAccountUsersInfiniteQuery).toHaveBeenLastCalledWith(
      {
        '+order': 'asc',
        '+order_by': 'username',
      },
      true
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(queryMocks.useAccountUsersInfiniteQuery).toHaveBeenLastCalledWith(
      {
        '+or': [
          { username: { '+contains': 'ali' } },
          { email: { '+contains': 'ali' } },
        ],
        '+order': 'asc',
        '+order_by': 'username',
      },
      true
    );

    vi.useRealTimers();
  });
});
