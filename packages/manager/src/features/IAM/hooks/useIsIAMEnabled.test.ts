import { renderHook, waitFor } from '@testing-library/react';

import { accountRolesFactory } from 'src/factories/accountRoles';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsIAMEnabled } from './useIsIAMEnabled';

const queryMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn().mockReturnValue({ foo: 'bar' }),
}));

vi.mock(import('src/queries/iam/iam'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
  };
});

describe('useIsIAMEnabled', () => {
  it('should be enabled for a BETA user', async () => {
    const rolePermissions = accountRolesFactory.build();
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json(rolePermissions);
      })
    );

    queryMocks.useAccountRoles.mockReturnValue({
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

  it('should enabled for a GA user', async () => {
    const rolePermissions = accountRolesFactory.build();
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json(rolePermissions);
      })
    );

    queryMocks.useAccountRoles.mockReturnValue({
      data: rolePermissions,
    });

    const flags = { iam: { beta: false, enabled: true } };

    const { result } = renderHook(() => useIsIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isIAMBeta).toBe(false);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(result.current.isIAMEnabled).toBe(true);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(queryMocks.useAccountRoles).toHaveBeenCalledWith(true);
    });
  });

  it('should be diabled for all users via a feature flag', async () => {
    const rolePermissions = accountRolesFactory.build();
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json(rolePermissions);
      })
    );

    queryMocks.useAccountRoles.mockReturnValue({
      data: rolePermissions,
    });

    const flags = { iam: { beta: false, enabled: false } };

    const { result } = renderHook(() => useIsIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isIAMBeta).toBe(false);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(result.current.isIAMEnabled).toBe(false);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(queryMocks.useAccountRoles).toHaveBeenCalledWith(false);
    });
  });

  it('should be diabled for a user via API', async () => {
    server.use(
      http.get('*/v4beta/iam/role-permissions', () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    queryMocks.useAccountRoles.mockReturnValue({
      data: null,
    });

    const flags = { iam: { beta: true, enabled: true } };

    const { result } = renderHook(() => useIsIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isIAMBeta).toBe(true);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(result.current.isIAMEnabled).toBe(false);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(queryMocks.useAccountRoles).toHaveBeenCalledWith(true);
    });
  });
});
