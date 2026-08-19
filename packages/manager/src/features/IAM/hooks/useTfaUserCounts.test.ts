import { renderHook } from '@testing-library/react';

import { wrapWithProviders } from '../utilities/testHelpers';
import { useTfaUserCounts } from './useTfaUserCounts';

const queryMocks = vi.hoisted(() => ({
  useAccountUsers: vi.fn(),
  useGetTfaOptionalUsersQuery: vi.fn(),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAccountUsers: queryMocks.useAccountUsers,
    useGetTfaOptionalUsersQuery: queryMocks.useGetTfaOptionalUsersQuery,
  };
});

describe('useTfaUserCounts', () => {
  beforeEach(() => {
    queryMocks.useAccountUsers.mockReturnValue({ data: { results: 10 } });
    queryMocks.useGetTfaOptionalUsersQuery.mockReturnValue({
      data: { results: 3 },
    });
  });

  it('returns correct counts when enforcement is enabled', () => {
    const { result } = renderHook(() => useTfaUserCounts(true), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(result.current.totalUsers).toBe(10);
    expect(result.current.optionalUsersCount).toBe(3);
    expect(result.current.enforcedUsersCount).toBe(7);
  });

  it('returns enforcedUsersCount of 0 when enforcement is disabled', () => {
    const { result } = renderHook(() => useTfaUserCounts(false), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(result.current.totalUsers).toBe(10);
    expect(result.current.optionalUsersCount).toBe(3);
    expect(result.current.enforcedUsersCount).toBe(0);
  });

  it('returns zeros when queries have no data', () => {
    queryMocks.useAccountUsers.mockReturnValue({ data: undefined });
    queryMocks.useGetTfaOptionalUsersQuery.mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => useTfaUserCounts(true), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(result.current.totalUsers).toBe(0);
    expect(result.current.optionalUsersCount).toBe(0);
    expect(result.current.enforcedUsersCount).toBe(0);
  });

  it('returns enforcedUsersCount equal to totalUsers when there are no optional users', () => {
    queryMocks.useGetTfaOptionalUsersQuery.mockReturnValue({
      data: { results: 0 },
    });

    const { result } = renderHook(() => useTfaUserCounts(true), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(result.current.totalUsers).toBe(10);
    expect(result.current.optionalUsersCount).toBe(0);
    expect(result.current.enforcedUsersCount).toBe(10);
  });

  it('returns correct counts when totalUsers is refetching with stale data', () => {
    queryMocks.useAccountUsers.mockReturnValue({
      data: { results: 10 },
      isLoading: false,
    });
    queryMocks.useGetTfaOptionalUsersQuery.mockReturnValue({
      data: { results: 2 },
      isLoading: false,
    });

    const { result } = renderHook(() => useTfaUserCounts(true), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.totalUsers).toBe(10);
    expect(result.current.optionalUsersCount).toBe(2);
    expect(result.current.enforcedUsersCount).toBe(8);
  });

  it('returns 0 for enforcedUsersCount while totalUsers is still loading (no data yet)', () => {
    queryMocks.useAccountUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    queryMocks.useGetTfaOptionalUsersQuery.mockReturnValue({
      data: { results: 2 },
      isLoading: false,
    });

    const { result } = renderHook(() => useTfaUserCounts(true), {
      wrapper: (ui) => wrapWithProviders(ui),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.totalUsers).toBe(0);
    expect(result.current.optionalUsersCount).toBe(2);
    expect(result.current.enforcedUsersCount).toBe(0);
  });
});
