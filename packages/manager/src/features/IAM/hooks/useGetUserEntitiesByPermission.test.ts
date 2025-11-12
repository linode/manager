import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useGetUserEntitiesByPermission } from './useGetUserEntitiesByPermission';

import type { APIError, Grants, Linode, Profile } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

const queryMocks = vi.hoisted(() => ({
  useGetUserEntitiesByPermissionQuery: vi.fn(),
  useGrants: vi.fn(),
  useIsIAMEnabled: vi.fn(),
  entityPermissionMapFrom: vi.fn(),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGetUserEntitiesByPermissionQuery:
      queryMocks.useGetUserEntitiesByPermissionQuery,
    useGrants: queryMocks.useGrants,
  };
});

vi.mock('./useIsIAMEnabled', () => ({
  useIsIAMEnabled: queryMocks.useIsIAMEnabled,
}));

vi.mock('./adapters/permissionAdapters', () => ({
  entityPermissionMapFrom: queryMocks.entityPermissionMapFrom,
}));

describe('useGetUserEntitiesByPermission', () => {
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

  const mockQuery = {
    data: mockLinodes,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    isSuccess: true,
    isError: false,
  } as unknown as UseQueryResult<Linode[], APIError[]>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    queryMocks.useGrants.mockReturnValue({
      data: undefined,
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

        queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
          data: mockEntitiesByPermission,
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'restricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(2);
          expect(result.current.data?.[0]).toEqual(mockLinodes[0]);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
          expect(result.current.data?.[1]).toEqual(mockLinodes[1]);
        });
      });

      it('should filter out entities not found in allEntities', async () => {
        const mockEntitiesByPermission = [
          { id: 1, label: 'linode-1', type: 'linode' },
          { id: 999, label: 'missing-linode', type: 'linode' },
        ];

        queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
          data: mockEntitiesByPermission,
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'restricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(1);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
          expect(result.current.data?.[0]?.id).toBe(1);
        });
      });

      it('should return empty array when user has no permissions', async () => {
        queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'restricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual([]);
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
        queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: false, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'unrestricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLinodes);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
          expect(result.current.data).toHaveLength(3);
        });
      });

      it('should not call permission query for unrestricted users', async () => {
        const flags = { iam: { beta: false, enabled: true } };

        renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'unrestricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(
            queryMocks.useGetUserEntitiesByPermissionQuery
          ).toHaveBeenCalled();
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

        queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
          data: mockEntitiesByPermission,
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: true, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'beta-restricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(1);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
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
        queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
          data: [],
          isLoading: false,
          error: null,
        });

        const flags = { iam: { beta: true, enabled: true } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'beta-unrestricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLinodes);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
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
        });

        queryMocks.entityPermissionMapFrom.mockReturnValue(mockPermissionMap);

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'grants-restricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(2);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
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
        });

        queryMocks.entityPermissionMapFrom.mockReturnValue(mockPermissionMap);

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'grants-restricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toHaveLength(1);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
          expect(result.current.data?.[0]?.id).toBe(1);
        });
      });

      it('should return empty array when grants are empty', async () => {
        queryMocks.useGrants.mockReturnValue({
          data: {} as Grants,
        });

        queryMocks.entityPermissionMapFrom.mockReturnValue({});

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'grants-restricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual([]);
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
        });

        const flags = { iam: { beta: false, enabled: false } };

        const { result } = renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'grants-unrestricted-user',
            }),
          {
            wrapper: (ui) => wrapWithTheme(ui, { flags }),
          }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLinodes);
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
          expect(result.current.data).toHaveLength(3);
        });
      });

      it('should not call entityPermissionMapFrom for unrestricted users', async () => {
        queryMocks.useGrants.mockReturnValue({
          data: {} as Grants,
        });

        const flags = { iam: { beta: false, enabled: false } };

        renderHook(
          () =>
            useGetUserEntitiesByPermission({
              query: mockQuery,
              entityType: 'linode',
              permission: 'view_linode',
              username: 'grants-unrestricted-user',
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
    it('should combine loading states from both queries', async () => {
      const loadingQuery = {
        ...mockQuery,
        isLoading: true,
      } as unknown as UseQueryResult<Linode[], APIError[]>;

      queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: true, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      const { result } = renderHook(
        () =>
          useGetUserEntitiesByPermission({
            query: loadingQuery,
            entityType: 'linode',
            permission: 'view_linode',
            username: 'test-user',
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isLoading false when all queries are complete', async () => {
      queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      queryMocks.useIsIAMEnabled.mockReturnValue({
        isIAMEnabled: true,
        isIAMBeta: false,
        profile: { restricted: true, username: 'test-user' } as Profile,
      });

      const flags = { iam: { beta: false, enabled: true } };

      const { result } = renderHook(
        () =>
          useGetUserEntitiesByPermission({
            query: mockQuery,
            entityType: 'linode',
            permission: 'view_linode',
            username: 'test-user',
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
    it('should combine error states from both queries', async () => {
      const mockError = [{ reason: 'Test error' }];
      const errorQuery = {
        ...mockQuery,
        error: mockError,
      } as unknown as UseQueryResult<Linode[], APIError[]>;

      queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
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
          useGetUserEntitiesByPermission({
            query: errorQuery,
            entityType: 'linode',
            permission: 'view_linode',
            username: 'test-user',
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      expect(result.current.error).toBeTruthy();
    });

    it('should handle permission query errors', async () => {
      const mockError = [{ reason: 'Permission query error' }];

      queryMocks.useGetUserEntitiesByPermissionQuery.mockReturnValue({
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
          useGetUserEntitiesByPermission({
            query: mockQuery,
            entityType: 'linode',
            permission: 'view_linode',
            username: 'test-user',
          }),
        {
          wrapper: (ui) => wrapWithTheme(ui, { flags }),
        }
      );

      expect(result.current.error).toEqual(mockError);
    });
  });
});
