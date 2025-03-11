import { renderHook } from '@testing-library/react';

import { useRestrictedGlobalGrantCheck } from './useRestrictedGlobalGrantCheck';

const queryMocks = vi.hoisted(() => ({
  useGrants: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGrants: queryMocks.useGrants,
    useProfile: queryMocks.useProfile,
  };
});

describe('useRestrictedGlobalGrantCheck', () => {
  it('returns true for restricted access with non-permitted grant level', () => {
    queryMocks.useGrants.mockReturnValue({
      data: { global: { account_access: 'read_only' } },
    });
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { result } = renderHook(() =>
      useRestrictedGlobalGrantCheck({
        globalGrantType: 'account_access',
        permittedGrantLevel: 'read_write',
      })
    );

    expect(result.current).toBe(true);
  });

  it('returns false for unrestricted access with permitted grant level', () => {
    queryMocks.useGrants.mockReturnValue({
      data: { global: { account_access: 'read_write' } },
    });
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const { result } = renderHook(() =>
      useRestrictedGlobalGrantCheck({
        globalGrantType: 'account_access',
        permittedGrantLevel: 'read_write',
      })
    );

    expect(result.current).toBe(false);
  });

  it('returns true for restricted access to non-account_access resource', () => {
    queryMocks.useGrants.mockReturnValue({
      data: { global: { add_linodes: false } },
    });
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { result } = renderHook(() =>
      useRestrictedGlobalGrantCheck({
        globalGrantType: 'add_linodes',
        permittedGrantLevel: 'read_write', // This param is ignored for non-account_access types
      })
    );

    expect(result.current).toBe(true);
  });

  // Add more tests as needed to cover different scenarios and edge cases
});
