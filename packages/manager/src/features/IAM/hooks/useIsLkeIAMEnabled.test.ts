import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsLkeIAMEnabled } from './useIsLkeIAMEnabled';

const queryMocks = vi.hoisted(() => ({
  useUserAccountPermissions: vi
    .fn()
    .mockReturnValue({ data: ['create_lkecluster'] }),
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

describe('useIsLkeIAMEnabled', () => {
  it('should be enabled when global IAM and iamLKE are enabled', async () => {
    const flags = { iam: { enabled: true }, iamLKE: true };

    const { result } = renderHook(() => useIsLkeIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isLkeIAMEnabled).toBe(true);
    });
  });

  it('should be disabled when iamLKE is off even if global IAM is on', async () => {
    const flags = { iam: { enabled: true }, iamLKE: false };

    const { result } = renderHook(() => useIsLkeIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isLkeIAMEnabled).toBe(false);
    });
  });

  it('should be disabled when global IAM is off', async () => {
    const flags = { iam: { enabled: false }, iamLKE: true };

    const { result } = renderHook(() => useIsLkeIAMEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    await waitFor(() => {
      expect(result.current.isLkeIAMEnabled).toBe(false);
    });
  });
});
