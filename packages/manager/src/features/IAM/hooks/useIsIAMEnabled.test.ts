import { renderHook, waitFor } from '@testing-library/react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsIAMEnabled } from './useIsIAMEnabled';

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({ foo: 'bar' }),
}));

vi.mock(import('src/queries/iam/iam'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
  };
});

describe('useIsIAMEnabled', () => {
  it('should correctly for IAM beta, enabled, API access', async () => {
    const rolePermissions = accountPermissionsFactory.build();
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json(rolePermissions);
      })
    );

    queryMocks.useAccountPermissions.mockReturnValue({
      data: rolePermissions,
    });

    const flags = { iam: { beta: true, enabled: true } };

    const { result } = renderHook(() => useIsIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isIAMBeta).toBe(true);
      expect(result.current.isIAMEnabled).toBe(true);
    });
  });

  it('should correctly for IAM port-beta, enabled, API access', async () => {
    const rolePermissions = accountPermissionsFactory.build();
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json(rolePermissions);
      })
    );

    queryMocks.useAccountPermissions.mockReturnValue({
      data: rolePermissions,
    });

    const flags = { iam: { beta: false, enabled: true } };

    const { result } = renderHook(() => useIsIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isIAMBeta).toBe(false);
      expect(result.current.isIAMEnabled).toBe(true);
    });
  });

  it('should correctly for IAM non-beta, disabled, API access', async () => {
    const rolePermissions = accountPermissionsFactory.build();
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json(rolePermissions);
      })
    );

    queryMocks.useAccountPermissions.mockReturnValue({
      data: rolePermissions,
    });

    const flags = { iam: { beta: false, enabled: false } };

    const { result } = renderHook(() => useIsIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isIAMBeta).toBe(false);
      expect(result.current.isIAMEnabled).toBe(false);
    });
  });

  it('should correctly for IAM beta, enabled, no API access', async () => {
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    queryMocks.useAccountPermissions.mockReturnValue({
      data: null,
    });

    const flags = { iam: { beta: true, enabled: true } };

    const { result } = renderHook(() => useIsIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isIAMBeta).toBe(true);
      expect(result.current.isIAMEnabled).toBe(false);
    });
  });
});
