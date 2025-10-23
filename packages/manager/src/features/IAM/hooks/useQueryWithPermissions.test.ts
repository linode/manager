import { renderHook } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useQueryWithPermissions } from './usePermissions';

import type { APIError } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

type Entity = { id: number; label: string };

const queryMocks = vi.hoisted(() => {
  return {
    useIsIAMEnabled: vi
      .fn()
      .mockReturnValue({ isIAMEnabled: true, isIAMBeta: true }),
    useGrants: vi.fn().mockReturnValue({ data: null }),
    useProfile: vi
      .fn()
      .mockReturnValue({ data: { username: 'user-1', restricted: true } }),
    useAccountRoles: vi.fn().mockReturnValue({
      data: {
        entity_access: [
          {
            type: 'linode',
            roles: [
              {
                name: 'linode_admin',
                description: 'Admin',
                permissions: ['update_linode', 'delete_linode'],
              },
            ],
          },
        ],
        account_access: [],
      },
      isLoading: false,
    }),
    useUserRoles: vi.fn().mockReturnValue({
      data: {
        entity_access: [{ id: 1, type: 'linode', roles: ['linode_admin'] }],
        account_access: [],
      },
      isLoading: false,
    }),
  };
});

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useGrants: queryMocks.useGrants,
    useProfile: queryMocks.useProfile,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
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

vi.mock('./adapters/permissionAdapters', async () => {
  const actual = await vi.importActual('./adapters/permissionAdapters');

  return {
    ...actual,
    entityPermissionMapFrom: vi.fn(() => {
      return {
        1: { update_linode: true, resize_volume: true, create_volume: true },
        2: { update_linode: true, resize_volume: true, create_volume: true },
      };
    }),
  };
});

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
    queryMocks.useUserRoles.mockReturnValue({
      data: {
        entity_access: [{ id: 1, type: 'linode', roles: ['linode_admin'] }],
        account_access: [],
      },
      isLoading: false,
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
    expect(queryMocks.useUserRoles).toHaveBeenCalledWith('user-1', true);
    expect(queryMocks.useAccountRoles).toHaveBeenCalledWith(true);

    // Only entity 1 has permissions
    expect(result.current.data.map((e) => e.id)).toEqual([1]);
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
    expect(queryMocks.useUserRoles).toHaveBeenCalledWith('user-1', false);
    expect(queryMocks.useAccountRoles).toHaveBeenCalledWith(false);

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
    expect(queryMocks.useUserRoles).toHaveBeenCalledWith('user-1', false);
    expect(queryMocks.useAccountRoles).toHaveBeenCalledWith(false);
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
    expect(queryMocks.useUserRoles).toHaveBeenCalledWith('user-1', false);
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
    expect(queryMocks.useUserRoles).toHaveBeenCalledWith('user-1', true);
    expect(queryMocks.useAccountRoles).toHaveBeenCalledWith(true);
  });

  it('marks loading when entity permissions queries are loading', () => {
    const flags = { iam: { beta: true, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: true,
    });
    queryMocks.useUserRoles.mockReturnValue({
      data: undefined,
      isLoading: true,
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

    expect(result.current.isLoading).toBe(true);
  });

  it('grants all permissions to unrestricted users', () => {
    const flags = { iam: { beta: true, enabled: true } };
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: true,
    });
    queryMocks.useProfile.mockReturnValue({
      data: { username: 'user-1', restricted: false },
    });
    queryMocks.useUserRoles.mockReturnValue({
      data: {
        entity_access: [], // Unrestricted users have no entity access entries
        account_access: [],
      },
      isLoading: false,
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

    // Unrestricted users should see all entities
    expect(result.current.data.map((e) => e.id)).toEqual([1, 2]);
    expect(result.current.hasFiltered).toBe(false);
  });
});
