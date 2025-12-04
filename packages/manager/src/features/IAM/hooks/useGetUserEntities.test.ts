import { renderHook } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useGetUserEntities } from './useGetUserEntities';

import type {
  EntityAccess,
  EntityByPermission,
  EntityType,
  IamUserRoles,
} from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useQueries: vi.fn().mockReturnValue({}),
}));

const iamQueriesMock = vi.hoisted(() => ({
  user: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    iamQueries: iamQueriesMock,
    useQueries: queryMocks.useQueries,
  };
});

describe('useGetUserEntities', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    iamQueriesMock.user.mockReturnValue({
      _ctx: {
        allUserEntities: vi.fn().mockReturnValue({
          queryKey: ['user-entities'],
          queryFn: vi.fn(),
        }),
      },
    });
  });

  const createMockUserRoles = (
    entityAccess: Array<{ id: number | string; roles: string[]; type: string }>
  ): IamUserRoles => ({
    account_access: [],
    entity_access: entityAccess as EntityAccess[],
  });

  const createMockEntities = (
    entities: Array<{ id: number | string; label: string; type: string }>
  ): EntityByPermission[] =>
    entities.map((e) => ({
      id: e.id,
      label: e.label,
      type: e.type as EntityType,
    }));

  it('should return undefined entities when userRoles is undefined', () => {
    queryMocks.useQueries.mockReturnValue([]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: undefined,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.userEntities).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch entities for all entity types in userRoles', () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
      { id: 2, type: 'volume', roles: ['volume_viewer'] },
      { id: 3, type: 'firewall', roles: ['firewall_editor'] },
    ]);

    queryMocks.useQueries.mockReturnValue([
      { data: [], isLoading: false, error: null },
      { data: [], isLoading: false, error: null },
      { data: [], isLoading: false, error: null },
    ]);

    renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    // Verify useQueries was called with correct configuration
    expect(queryMocks.useQueries).toHaveBeenCalledWith(
      expect.objectContaining({
        queries: expect.arrayContaining([
          expect.objectContaining({
            enabled: true,
            staleTime: 1 * 60 * 1000, // 1 minute
          }),
        ]),
      })
    );
  });

  it('should combine entities from multiple entity types', async () => {
    const mockUserRoles = createMockUserRoles([
      { id: 123, type: 'linode', roles: ['linode_admin'] },
      { id: 456, type: 'volume', roles: ['volume_viewer'] },
    ]);

    const linodeEntities = createMockEntities([
      { id: 123, label: 'my-linode-1', type: 'linode' },
      { id: 124, label: 'my-linode-2', type: 'linode' },
    ]);

    const volumeEntities = createMockEntities([
      { id: 456, label: 'my-volume-1', type: 'volume' },
    ]);

    queryMocks.useQueries.mockReturnValue([
      { data: linodeEntities, isLoading: false, error: null },
      { data: volumeEntities, isLoading: false, error: null },
    ]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.userEntities).toHaveLength(3);
    expect(result.current.userEntities).toEqual([
      ...linodeEntities,
      ...volumeEntities,
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle loading state correctly', () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
    ]);

    queryMocks.useQueries.mockReturnValue([
      { data: undefined, isLoading: true, error: null },
    ]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.userEntities).toBeUndefined();
  });

  it('should handle error state correctly', () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
    ]);

    const mockError = new Error('Failed to fetch');
    queryMocks.useQueries.mockReturnValue([
      { data: undefined, isLoading: false, error: mockError },
    ]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.error).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle mixed numeric and string entity IDs (for images)', async () => {
    const mockUserRoles = createMockUserRoles([
      { id: 123, type: 'linode', roles: ['linode_admin'] },
      { id: 'private/456', type: 'image', roles: ['image_viewer'] },
    ]);

    const mixedEntities = [
      createMockEntities([{ id: 123, label: 'my-linode', type: 'linode' }]),
      createMockEntities([
        { id: 'private/456', label: 'my-image', type: 'image' },
      ]),
    ];

    queryMocks.useQueries.mockReturnValue([
      { data: mixedEntities[0], isLoading: false, error: null },
      { data: mixedEntities[1], isLoading: false, error: null },
    ]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.userEntities).toHaveLength(2);
    expect(result.current.userEntities?.[0].id).toBe(123);
    expect(result.current.userEntities?.[1].id).toBe('private/456');
  });

  it('should handle empty entity_access array', () => {
    const mockUserRoles = createMockUserRoles([]);

    queryMocks.useQueries.mockReturnValue([]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.userEntities).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should set enabled to false when username is empty', () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
    ]);

    queryMocks.useQueries.mockReturnValue([
      { data: [], isLoading: false, error: null },
    ]);

    renderHook(
      () =>
        useGetUserEntities({
          username: '',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    const callArgs = queryMocks.useQueries.mock.calls[0][0];
    expect(callArgs.queries[0].enabled).toBe(false);
  });

  it('should handle partial loading when some queries complete before others', () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
      { id: 2, type: 'volume', roles: ['volume_viewer'] },
    ]);

    queryMocks.useQueries.mockReturnValue([
      {
        data: [{ id: 1, label: 'linode-1', type: 'linode' }],
        isLoading: false,
        error: null,
      },
      { data: undefined, isLoading: true, error: null },
    ]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    // Should show loading if any query is loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.userEntities).toBeUndefined();
  });

  it('should flatten nested entity arrays correctly', async () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
      { id: 2, type: 'volume', roles: ['volume_viewer'] },
    ]);

    const mockEntities1 = createMockEntities([
      { id: 1, label: 'entity-1', type: 'linode' },
      { id: 2, label: 'entity-2', type: 'linode' },
    ]);

    const mockEntities2 = createMockEntities([
      { id: 3, label: 'entity-3', type: 'volume' },
    ]);

    queryMocks.useQueries.mockReturnValue([
      { data: mockEntities1, isLoading: false, error: null },
      { data: mockEntities2, isLoading: false, error: null },
    ]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.userEntities).toHaveLength(3);
    expect(result.current.userEntities).toEqual([
      ...mockEntities1,
      ...mockEntities2,
    ]);
  });

  it('should handle queries with undefined data gracefully', async () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
      { id: 2, type: 'volume', roles: ['volume_viewer'] },
    ]);

    queryMocks.useQueries.mockReturnValue([
      { data: undefined, isLoading: false, error: null },
      {
        data: [{ id: 2, label: 'volume-1', type: 'volume' }],
        isLoading: false,
        error: null,
      },
    ]);

    const { result } = renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(result.current.userEntities).toHaveLength(1);
    expect(result.current.userEntities?.[0].id).toBe(2);
    expect(result.current.isLoading).toBe(false);
  });

  it('should call iamQueries with correct username for each entity type', () => {
    const mockUserRoles = createMockUserRoles([
      { id: 1, type: 'linode', roles: ['linode_admin'] },
      { id: 2, type: 'firewall', roles: ['firewall_viewer'] },
    ]);

    queryMocks.useQueries.mockReturnValue([
      { data: [], isLoading: false, error: null },
      { data: [], isLoading: false, error: null },
    ]);

    renderHook(
      () =>
        useGetUserEntities({
          username: 'test-user',
          userRoles: mockUserRoles,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui),
      }
    );

    expect(iamQueriesMock.user).toHaveBeenCalledWith('test-user');
    expect(iamQueriesMock.user()._ctx.allUserEntities).toHaveBeenCalledTimes(2);
  });
});
