import { renderHook } from '@testing-library/react';

import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';

const queryMocks = vi.hoisted(() => ({
  isParentTokenValid: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/Account/SwitchAccounts/utils', async () => {
  const actual = await vi.importActual(
    'src/features/Account/SwitchAccounts/utils'
  );
  return {
    ...actual,
    isParentTokenValid: queryMocks.isParentTokenValid,
  };
});

const mockUpdateState = vi.fn();


// Utility function to render the hook with the wrapper and initialProps
const renderUseIsParentTokenExpiredHook = ({
  isProxyUser,
}: {
  isProxyUser: boolean;
}) =>
  renderHook(() => useIsParentTokenExpired({ isProxyUser }), {
    initialProps: isProxyUser,
  });

describe('useIsParentTokenExpired', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.isParentTokenValid.mockReturnValue(true);
  });

  it('should not mark parent token as expired if it is valid', () => {
    const { result } = renderUseIsParentTokenExpiredHook({
      isProxyUser: true,
    });

    expect(result.current.isParentTokenExpired).toBe(false);
  });

  it('should mark parent token as expired if it is invalid', () => {
    queryMocks.isParentTokenValid.mockReturnValue(false);
    const { result } = renderUseIsParentTokenExpiredHook({
      isProxyUser: true,
    });

    expect(result.current.isParentTokenExpired).toBe(true);
  });

  it('should not update the session context when isParentTokenExpired is false', () => {
    renderUseIsParentTokenExpiredHook({
      isProxyUser: true,
    });

    expect(mockUpdateState).not.toHaveBeenCalled();
  });

  it('should react to isProxyUser changes', () => {
    const { rerender, result } = renderHook(
      ({ isProxyUser }) => useIsParentTokenExpired({ isProxyUser }),
      {
        initialProps: { isProxyUser: false },
      }
    );

    // Initially, with isProxyUser false, token should not be marked as expired
    expect(result.current.isParentTokenExpired).toBe(false);

    // Change mock value, rerender with isProxyUser true
    queryMocks.isParentTokenValid.mockReturnValue(false);
    rerender({ isProxyUser: true });

    // Now, if the token is invalid, isParentTokenExpired should be true
    expect(result.current.isParentTokenExpired).toBe(true);
  });
});
