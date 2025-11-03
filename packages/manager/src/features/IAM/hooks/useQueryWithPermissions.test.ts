import { renderHook } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useQueryWithPermissions } from './usePermissions';

import type { EntityBase } from './usePermissions';
import type { APIError, PermissionType } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

type Entity = { id: number; label: string };

const queryMocks = vi.hoisted(() => {
  let entitiesPermsLoading = false;

  return {
    useIsIAMEnabled: vi
      .fn()
      .mockReturnValue({ isIAMEnabled: true, isIAMBeta: true }),
    useGrants: vi.fn().mockReturnValue({ data: null }),
    useProfile: vi
      .fn()
      .mockReturnValue({ data: { username: 'user-1', restricted: true } }),
    useQueries: Object.assign(
      vi.fn().mockImplementation(({ queries }) =>
        (queries || []).map(() => ({
          data: null,
          error: null,
          isError: false,
          isLoading: entitiesPermsLoading,
        }))
      ),
      {
        setEntitiesPermsLoading: (b: boolean) => {
          entitiesPermsLoading = b;
        },
      }
    ),
  };
});

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useGrants: queryMocks.useGrants,
    useProfile: queryMocks.useProfile,
    useQueries: queryMocks.useQueries,
  };
});

vi.mock('src/features/IAM/hooks/useIsIAMEnabled', async () => {
  const actual = await vi.importActual(
    'src/features/IAM/hooks/useIsIAMEnabled'
  );

  return {
    ...actual,
    useIsIAMEnabled: queryMocks.useIsIAMEnabled,
  };
});

vi.mock('./adapters/permissionAdapters', () => ({
  toEntityPermissionMap: vi.fn(
    (entities: EntityBase[] = [], entitiesPermissions: PermissionType[]) => {
      const map: Record<number, Record<string, boolean>> = {};
      entities.forEach((e) => {
        map[e.id] = entitiesPermissions?.reduce<Record<string, boolean>>(
          (acc, p) => {
            acc[p] = e.id === 1;
            return acc;
          },
          {}
        );
      });

      return map;
    }
  ),
  entityPermissionMapFrom: vi.fn(() => {
    return {
      1: { update_linode: true, resize_volume: true, create_volume: true },
      2: { update_linode: true, resize_volume: true, create_volume: true },
    };
  }),
}));

describe('useQueryWithPermissions', () => {
  const entities: Entity[] = [
    { id: 1, label: 'one' },
    { id: 2, label: 'two' },
  ];

  const baseQueryResult = {
    data: entities,
    error: null,
    isError: false,
    isLoading: false,
  } as UseQueryResult<Entity[], APIError[]>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useQueries.setEntitiesPermsLoading(false);
  });

  it('uses Beta permissions when IAM enabled + beta true + in scope; filters restricted entities', () => {
    const flags = { iam: { beta: true, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: true,
    });
    queryMocks.useProfile.mockReturnValue({
      data: { username: 'user-1', restricted: true },
    });

    const { result } = renderHook(
      () =>
        useQueryWithPermissions(
          baseQueryResult,
          'linode',
          ['update_linode'],
          true
        ),
      { wrapper: (ui) => wrapWithTheme(ui, { flags }) }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);

    const calls = queryMocks.useQueries.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const queryArgs = calls[0][0];
    expect(
      queryArgs.queries.every((q: { enabled?: boolean }) => q.enabled === true)
    ).toBe(true);

    expect(result.current.data.map((e) => e.id)).toEqual([]);
    expect(result.current.hasFiltered).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('falls back to grants when IAM disabled', () => {
    const flags = { iam: { beta: false, enabled: false } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: false,
      isIAMBeta: false,
    });

    const { result } = renderHook(
      () =>
        useQueryWithPermissions(
          baseQueryResult,
          'linode',
          ['update_linode'],
          true
        ),
      { wrapper: (ui) => wrapWithTheme(ui, { flags }) }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(true);

    const queryArgs = queryMocks.useQueries.mock.calls[0][0];
    expect(
      queryArgs.queries.every((q: { enabled?: boolean }) => q.enabled === false)
    ).toBe(true);

    expect(result.current.data.map((e) => e.id)).toEqual([1, 2]);
    expect(result.current.hasFiltered).toBe(false);
  });

  it('falls back to grants when Beta true but entityType not in scope', () => {
    const flags = { iam: { beta: true, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: true,
    });

    renderHook(
      () =>
        useQueryWithPermissions(
          baseQueryResult,
          'volume',
          ['resize_volume'],
          true
        ),
      { wrapper: (ui) => wrapWithTheme(ui, { flags }) }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(true);
    const qArg = queryMocks.useQueries.mock.calls[0][0];
    expect(
      qArg.queries.every((q: { enabled?: boolean }) => q.enabled === false)
    ).toBe(true);
  });

  it('falls back to grants when Beta true but permission is in the LA exclusion list', () => {
    const flags = { iam: { beta: true, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: true,
    });

    renderHook(
      () =>
        useQueryWithPermissions(
          baseQueryResult,
          'volume',
          ['create_volume'], // blacklisted
          true
        ),
      { wrapper: (ui) => wrapWithTheme(ui, { flags }) }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(true);
    const queryArgs = queryMocks.useQueries.mock.calls[0][0];
    expect(
      queryArgs.queries.every((q: { enabled?: boolean }) => q.enabled === false)
    ).toBe(true);
  });

  it('uses LA permissions when IAM enabled + beta false', () => {
    const flags = { iam: { beta: false, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: false,
    });

    renderHook(
      () =>
        useQueryWithPermissions(
          baseQueryResult,
          'linode',
          ['update_linode'],
          true
        ),
      { wrapper: (ui) => wrapWithTheme(ui, { flags }) }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);
    const queryArgs = queryMocks.useQueries.mock.calls[0][0];
    expect(
      queryArgs.queries.every((q: { enabled?: boolean }) => q.enabled === true)
    ).toBe(true);
  });

  it('marks loading when entity permissions queries are loading', () => {
    const flags = { iam: { beta: true, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: true,
    });
    queryMocks.useQueries.setEntitiesPermsLoading(true);

    const { result } = renderHook(
      () =>
        useQueryWithPermissions(
          baseQueryResult,
          'linode',
          ['update_linode'],
          true
        ),
      { wrapper: (ui) => wrapWithTheme(ui, { flags }) }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('grants all permissions to unrestricted (admin) users without making permission API calls', () => {
    const flags = { iam: { beta: true, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: true,
    });
    queryMocks.useProfile.mockReturnValue({
      data: { username: 'admin-user', restricted: false },
    });

    const { result } = renderHook(
      () =>
        useQueryWithPermissions(
          baseQueryResult,
          'linode',
          ['update_linode', 'delete_linode', 'reboot_linode'],
          true
        ),
      { wrapper: (ui) => wrapWithTheme(ui, { flags }) }
    );

    // Verify grants are NOT fetched (IAM is enabled)
    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);

    // Verify permission queries are disabled (no N API calls for unrestricted users!)
    const queryArgs = queryMocks.useQueries.mock.calls[0][0];
    expect(
      queryArgs.queries.every((q: { enabled?: boolean }) => q.enabled === false)
    ).toBe(true);

    // Unrestricted users should see ALL entities
    expect(result.current.data.map((e) => e.id)).toEqual([1, 2]);
    expect(result.current.hasFiltered).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
