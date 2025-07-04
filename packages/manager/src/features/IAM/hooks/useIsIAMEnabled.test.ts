import { renderHook, waitFor } from '@testing-library/react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsIAMEnabled } from './useIsIAMEnabled';

const queryMocks = vi.hoisted(() => ({
  useUserAccountPermissions: vi
    .fn()
    .mockReturnValue(['cancel_account', 'create_user']),
  useProfile: vi
    .fn()
    .mockReturnValue({ data: { username: 'mock-user', restricted: true } }),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useUserAccountPermissions: queryMocks.useUserAccountPermissions,
    useProfile: queryMocks.useProfile,
  };
});

describe('useIsIAMEnabled', () => {
  it('should be enabled for a BETA user', async () => {
    const accountPermissions = ['cancel_account', 'create_user'];
    server.use(
      http.get('*/v4beta/iam/users/mock-user/permissions/account', () => {
        return HttpResponse.json(accountPermissions);
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: accountPermissions,
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
    const accountPermissions = ['cancel_account', 'create_user'];
    server.use(
      http.get('*/v4beta/iam/users/mock-user/permissions/account', () => {
        return HttpResponse.json(accountPermissions);
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: accountPermissions,
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
      expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(true);
    });
  });

  it('should be diabled for all users via a feature flag', async () => {
    const accountPermissions = ['cancel_account', 'create_user'];
    server.use(
      http.get('*/v4beta/iam/users/mock-user/permissions/account', () => {
        return HttpResponse.json(accountPermissions);
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: accountPermissions,
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
      expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(false);
    });
  });

  it('should be diabled for a user via API', async () => {
    server.use(
      http.get('*/v4beta/iam/users/mock-user/permissions/account', () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
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
      expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(true);
    });
  });
});
