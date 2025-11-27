import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useGetAllUserEntitiesByPermission } from './useGetAllUserEntitiesByPermission';

import type { Grants, Linode, Profile } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useAllFirewallsQuery: vi.fn(),
  useAllImagesQuery: vi.fn(),
  useAllLinodesQuery: vi.fn(),
  useAllNodeBalancersQuery: vi.fn(),
  useAllVolumesQuery: vi.fn(),
  useAllVPCsQuery: vi.fn(),
  useGetAllUserEntitiesByPermissionQuery: vi.fn(),
  useGrants: vi.fn(),
  useIsIAMEnabled: vi.fn(),
  entityPermissionMapFrom: vi.fn(),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAllFirewallsQuery: queryMocks.useAllFirewallsQuery,
    useAllImagesQuery: queryMocks.useAllImagesQuery,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
    useAllNodeBalancersQuery: queryMocks.useAllNodeBalancersQuery,
    useAllVolumesQuery: queryMocks.useAllVolumesQuery,
    useAllVPCsQuery: queryMocks.useAllVPCsQuery,
    useGetAllUserEntitiesByPermissionQuery:
      queryMocks.useGetAllUserEntitiesByPermissionQuery,
    useGrants: queryMocks.useGrants,
  };
});

vi.mock('./useIsIAMEnabled', () => ({
  useIsIAMEnabled: queryMocks.useIsIAMEnabled,
}));

vi.mock('./adapters/permissionAdapters', () => ({
  entityPermissionMapFrom: queryMocks.entityPermissionMapFrom,
}));

describe('useGetAllUserEntitiesByPermission', () => {
  const mockLinodes: Linode[] = [
    {
      id: 1,
      label: 'linode-1',
      region: 'us-east',
      type: 'g6-standard-1',
    } as Linode,
    {
      id: 2,
      label: 'linode-2',
      region: 'us-east',
      type: 'g6-standard-1',
    } as Linode,
    {
      id: 3,
      label: 'linode-3',
      region: 'us-east',
      type: 'g6-standard-1',
    } as Linode,
  ];

  const mockLinodeQueryResult = {
    data: mockLinodes,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    isSuccess: true,
    isError: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for all entity query hooks
    queryMocks.useAllLinodesQuery.mockReturnValue(mockLinodeQueryResult);
    queryMocks.useAllFirewallsQuery.mockReturnValue(mockLinodeQueryResult);
    queryMocks.useAllVolumesQuery.mockReturnValue(mockLinodeQueryResult);
    queryMocks.useAllNodeBalancersQuery.mockReturnValue(mockLinodeQueryResult);
    queryMocks.useAllImagesQuery.mockReturnValue(mockLinodeQueryResult);
    queryMocks.useAllVPCsQuery.mockReturnValue(mockLinodeQueryResult);

    queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    queryMocks.useGrants.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  describe('IAM Enabled - LA Mode', () => {
    describe('Restricted User', () => {
      beforeEach(() => {
        queryMocks.useIsIAMEnabled.mockReturnValue({
          isIAMEnabled: true,
          isIAMBeta: false,
          profile: { restricted: true, username: 'restricted-user' } as Profile,
        });
      });

      it('should return filtered entities based on permission query', async () => {
        const mockEntitiesByPermission = [
          { id: 1, label: 'linode-1', type: 'linode' },
          { id: 2, label: 'linode-2', type: 'linode' },
        ];

        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: mockEntitiesByPermission,
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(3); // Returns all from query
          expect(result.current.filter).toEqual({
            '+or': [{ id: 1 }, { id: 2 }],
          });
        });
      });

      it('should call entity query with filtered IDs', async () => {
        const mockEntitiesByPermission = [
          { id: 1, label: 'linode-1', type: 'linode' },
          { id: 2, label: 'linode-2', type: 'linode' },
        ];

        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: mockEntitiesByPermission,
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(queryMocks.useAllLinodesQuery).toHaveBeenCalledWith(
            {},
            { '+or': [{ id: 1 }, { id: 2 }] },
            true
          );
        });
      });

      it('should return empty array when user has no permissions', async () => {
        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: null,
        });

        queryMocks.useAllLinodesQuery.mockReturnValue({
          ...mockLinodeQueryResult,
          data: [],
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual([]);
        });
      });

      it('should not enable entity query while waiting for permission IDs', async () => {
        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: undefined, // Still loading
          isLoading: true,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          // Query should be called with enabled=false
          expect(queryMocks.useAllLinodesQuery).toHaveBeenCalledWith(
            {},
            {},
            false
          );
          // Data should be empty array, not cached data
          expect(result.current.data).toEqual([]);
        });
      });

      it('should return empty array and error when permission query fails', async () => {
        const mockError = [{ reason: 'Permission denied' }];

        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: undefined,
          isLoading: false,
          error: mockError,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual([]); // Security: don't return all
          expect(result.current.error).toEqual(mockError);
        });
      });
    });

    describe('Unrestricted User', () => {
      beforeEach(() => {
        queryMocks.useIsIAMEnabled.mockReturnValue({
          isIAMEnabled: true,
          isIAMBeta: false,
          profile: {
            restricted: false,
            username: 'unrestricted-user',
          } as Profile,
        });
      });

      it('should return all entities without filtering', async () => {
        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLinodes);
          expect(result.current.data).toHaveLength(3);
          expect(result.current.filter).toEqual({}); // No filter for unrestricted
        });
      });

      it('should call entity query without filter', async () => {
        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(queryMocks.useAllLinodesQuery).toHaveBeenCalledWith(
            {},
            {}, // Empty filter
            true
          );
        });
      });
    });
  });

  describe('IAM Enabled - Beta Mode', () => {
    describe('Restricted User', () => {
      beforeEach(() => {
        queryMocks.useIsIAMEnabled.mockReturnValue({
          isIAMEnabled: true,
          isIAMBeta: true,
          profile: {
            restricted: true,
            username: 'beta-restricted-user',
          } as Profile,
        });
      });

      it('should use IAM permissions for beta scope entities', async () => {
        const mockEntitiesByPermission = [
          { id: 1, label: 'linode-1', type: 'linode' },
        ];

        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: mockEntitiesByPermission,
          isLoading: false,
          error: null,
        });

        queryMocks.useAllLinodesQuery.mockReturnValue({
          ...mockLinodeQueryResult,
          data: [mockLinodes[0]],
        });

        const flags = { iam: { beta: true, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(1);
          expect(result.current.data?.[0]?.id).toBe(1);
        });
      });
    });

    describe('Unrestricted User', () => {
      beforeEach(() => {
        queryMocks.useIsIAMEnabled.mockReturnValue({
          isIAMEnabled: true,
          isIAMBeta: true,
          profile: {
            restricted: false,
            username: 'beta-unrestricted-user',
          } as Profile,
        });
      });

      it('should return all entities for unrestricted beta users', async () => {
        queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: true, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLinodes);
          expect(result.current.data).toHaveLength(3);
        });
      });
    });
  });

  describe('IAM Disabled - Using Grants', () => {
    describe('Restricted User', () => {
      beforeEach(() => {
        queryMocks.useIsIAMEnabled.mockReturnValue({
          isIAMEnabled: false,
          isIAMBeta: false,
          profile: {
            restricted: true,
            username: 'grants-restricted-user',
          } as Profile,
        });
      });

      it('should filter entities based on grants permission map', async () => {
        const mockGrants: Grants = {
          linode: [
            { id: 1, permissions: 'read_write' },
            { id: 2, permissions: 'read_only' },
          ],
        } as Grants;

        const mockPermissionMap = {
          1: { view_linode: true },
          2: { view_linode: true },
        };

        queryMocks.useGrants.mockReturnValue({
          data: mockGrants,
          isLoading: false,
        });

        queryMocks.entityPermissionMapFrom.mockReturnValue(mockPermissionMap);

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(2);
          expect(queryMocks.entityPermissionMapFrom).toHaveBeenCalledWith(
            mockGrants,
            'linode',
            expect.objectContaining({ restricted: true })
          );
        });
      });

      it('should filter out entities without permission in grants', async () => {
        const mockGrants: Grants = {
          linode: [{ id: 1, permissions: 'read_write' }],
        } as Grants;

        const mockPermissionMap = {
          1: { view_linode: true },
          // Entities 2 and 3 don't have the permission
        };

        queryMocks.useGrants.mockReturnValue({
          data: mockGrants,
          isLoading: false,
        });

        queryMocks.entityPermissionMapFrom.mockReturnValue(mockPermissionMap);

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(1);
          expect(result.current.data?.[0]?.id).toBe(1);
        });
      });

      it('should return empty array when grants are empty', async () => {
        queryMocks.useGrants.mockReturnValue({
          data: {} as Grants,
          isLoading: false,
        });

        queryMocks.entityPermissionMapFrom.mockReturnValue({});

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual([]);
        });
      });

      it('should call entity query without filter for legacy grants', async () => {
        queryMocks.useGrants.mockReturnValue({
          data: {} as Grants,
          isLoading: false,
        });

        const flags = { iam: { beta: false, enabled: false } };

        renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          // Legacy path calls query without filter
          expect(queryMocks.useAllLinodesQuery).toHaveBeenCalledWith(
            {},
            {},
            true
          );
        });
      });
    });

    describe('Unrestricted User', () => {
      beforeEach(() => {
        queryMocks.useIsIAMEnabled.mockReturnValue({
          isIAMEnabled: false,
          isIAMBeta: false,
          profile: {
            restricted: false,
            username: 'grants-unrestricted-user',
          } as Profile,
        });
      });

      it('should return all entities without grant filtering', async () => {
        queryMocks.useGrants.mockReturnValue({
          data: undefined,
          isLoading: false,
        });

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLinodes);
          expect(result.current.data).toHaveLength(3);
        });
      });

      it('should not call entityPermissionMapFrom for unrestricted users', async () => {
        queryMocks.useGrants.mockReturnValue({
          data: {} as Grants,
          isLoading: false,
        });

        const flags = { iam: { beta: false, enabled: false } };

        renderHook(
          () =>
            useGetAllUserEntitiesByPermission({
              entityType: 'linode',
              permission: 'view_linode',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(queryMocks.entityPermissionMapFrom).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should combine loading states from permission and entity queries', async () => {
      queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      queryMocks.useAllLinodesQuery.mockReturnValue({
        ...mockLinodeQueryResult,
        isLoading: true,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: true, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      const { result } = renderHook(
        () =>
          useGetAllUserEntitiesByPermission({
            entityType: 'linode',
            permission: 'view_linode',
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isLoading false when all queries are complete', async () => {
      queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      queryMocks.useAllLinodesQuery.mockReturnValue({
        ...mockLinodeQueryResult,
        isLoading: false,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: true, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      const { result } = renderHook(
        () =>
          useGetAllUserEntitiesByPermission({
            entityType: 'linode',
            permission: 'view_linode',
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error States', () => {
    it('should return permission query error and empty data', async () => {
      const mockError = [{ reason: 'Permission query error' }];

      queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: true, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      const { result } = renderHook(
        () =>
          useGetAllUserEntitiesByPermission({
            entityType: 'linode',
            permission: 'view_linode',
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
        expect(result.current.data).toEqual([]); // Security: empty on error
      });
    });

    it('should handle entity query errors', async () => {
      const mockError = [{ reason: 'Entity query error' }];

      queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
        data: [{ id: 1, label: 'linode-1', type: 'linode' }],
        isLoading: false,
        error: null,
      });

      queryMocks.useAllLinodesQuery.mockReturnValue({
        ...mockLinodeQueryResult,
        error: mockError,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: true, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      const { result } = renderHook(
        () =>
          useGetAllUserEntitiesByPermission({
            entityType: 'linode',
            permission: 'view_linode',
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('Custom Filter and Params', () => {
    it('should merge custom filter with entity ID filter', async () => {
      const customFilter = { region: 'us-east' };
      const mockEntitiesByPermission = [
        { id: 1, label: 'linode-1', type: 'linode' },
      ];

      queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
        data: mockEntitiesByPermission,
        isLoading: false,
        error: null,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: true, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      renderHook(
        () =>
          useGetAllUserEntitiesByPermission({
            entityType: 'linode',
            permission: 'view_linode',
            filter: customFilter,
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      await waitFor(() => {
        expect(queryMocks.useAllLinodesQuery).toHaveBeenCalledWith(
          {},
          { region: 'us-east', '+or': [{ id: 1 }] },
          true
        );
      });
    });

    it('should pass custom params to entity query', async () => {
      const customParams = { page: 1, page_size: 50 };

      queryMocks.useGetAllUserEntitiesByPermissionQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: false, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      renderHook(
        () =>
          useGetAllUserEntitiesByPermission({
            entityType: 'linode',
            permission: 'view_linode',
            params: customParams,
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      await waitFor(() => {
        expect(queryMocks.useAllLinodesQuery).toHaveBeenCalledWith(
          customParams,
          {},
          true
        );
      });
    });
  });
});
