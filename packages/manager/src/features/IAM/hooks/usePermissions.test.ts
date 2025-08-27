import { renderHook } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { usePermissions } from './usePermissions';

import type { AccessType, PermissionType } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useIsIAMEnabled: vi
    .fn()
    .mockReturnValue({ isIAMEnabled: true, isIAMBeta: true }),
  useUserAccountPermissions: vi.fn().mockReturnValue({
    data: ['cancel_account', 'create_linode'],
  }),
  useUserEntityPermissions: vi
    .fn()
    .mockReturnValue({ data: ['boot_linode', 'update_linode'] }),
  useGrants: vi.fn().mockReturnValue({ data: null }),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useUserAccountPermissions: queryMocks.useUserAccountPermissions,
    useUserEntityPermissions: queryMocks.useUserEntityPermissions,
    useGrants: queryMocks.useGrants,
  };
});

vi.mock('./useIsIAMEnabled', () => ({
  useIsIAMEnabled: queryMocks.useIsIAMEnabled,
}));

vi.mock('./adapters', () => ({
  fromGrants: vi.fn(
    (
      _accessType: AccessType,
      permissions: PermissionType[],
      _grants: unknown,
      _entityId?: number
    ) => {
      return permissions.reduce<Record<PermissionType, boolean>>(
        (acc, p) => {
          acc[p] = true;
          return acc;
        },
        {} as Record<PermissionType, boolean>
      );
    }
  ),
  toPermissionMap: vi.fn(
    (permissions: PermissionType[], _permsData: unknown) => {
      return permissions.reduce<Record<PermissionType, boolean>>(
        (acc, p) => {
          acc[p] = true;
          return acc;
        },
        {} as Record<PermissionType, boolean>
      );
    }
  ),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct map when IAM is enabled (account)', () => {
    const flags = { iam: { beta: true, enabled: true } };

    renderHook(
      () =>
        usePermissions({
          accessType: 'account',
          permissionsToCheck: ['cancel_account', 'create_linode'],
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui, { flags }),
      }
    );

    expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(true);
    expect(queryMocks.useUserEntityPermissions).toHaveBeenCalledWith(
      'account',
      undefined,
      true
    );
    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);
  });

  it('returns correct map when IAM is enabled (entity)', () => {
    const flags = { iam: { beta: true, enabled: true } };

    renderHook(
      () =>
        usePermissions({
          accessType: 'linode',
          permissionsToCheck: ['reboot_linode', 'view_linode'],
          entityId: 123,
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui, { flags }),
      }
    );

    expect(queryMocks.useUserEntityPermissions).toHaveBeenCalledWith(
      'linode',
      123,
      true
    );
    expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(false);
    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);
  });

  it('returns correct map when IAM is disabled (uses grants)', () => {
    queryMocks.useIsIAMEnabled.mockReturnValue({ isIAMEnabled: false });
    queryMocks.useUserAccountPermissions.mockReturnValue({ data: null });
    queryMocks.useUserEntityPermissions.mockReturnValue({ data: null });
    queryMocks.useGrants.mockReturnValue({
      data: { global: { add_linode: true } },
    });

    const flags = { iam: { beta: false, enabled: false } };
    renderHook(
      () =>
        usePermissions({
          accessType: 'account',
          permissionsToCheck: ['cancel_account', 'create_linode'],
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui, { flags }),
      }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(true);
    expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(false);
    expect(queryMocks.useUserEntityPermissions).toHaveBeenCalledWith(
      'account',
      undefined,
      false
    );
  });

  it('does not serve IAM permissions when limited availability only is true (uses grants)', () => {
    const flags = { iam: { beta: true, enabled: true } };

    renderHook(
      () =>
        usePermissions({
          accessType: 'account',
          permissionsToCheck: ['cancel_account', 'create_linode'],
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui, { flags }),
      }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(true);
    expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(false);
    expect(queryMocks.useUserEntityPermissions).toHaveBeenCalledWith(
      'account',
      undefined,
      false
    );
  });

  it('serves IAM permissions when limited availability only is true and IAM beta is false (Limited Availability)', () => {
    queryMocks.useIsIAMEnabled.mockReturnValue({
      isIAMEnabled: true,
      isIAMBeta: false,
    });
    const flags = { iam: { beta: false, enabled: true } };

    renderHook(
      () =>
        usePermissions({
          accessType: 'account',
          permissionsToCheck: ['cancel_account', 'create_linode'],
        }),
      {
        wrapper: (ui) => wrapWithTheme(ui, { flags }),
      }
    );

    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);
    expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(true);
    expect(queryMocks.useUserEntityPermissions).toHaveBeenCalledWith(
      'account',
      undefined,
      true
    );
  });
});
