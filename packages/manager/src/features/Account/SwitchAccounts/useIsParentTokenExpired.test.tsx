import { renderHook } from '@testing-library/react';
import * as React from 'react';

import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';

const queryMocks = vi.hoisted(() => ({
  isParentTokenValid: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/Account/utils', async () => {
  const actual = await vi.importActual('src/features/Account/utils');
  return {
    ...actual,
    isParentTokenValid: queryMocks.isParentTokenValid,
  };
});

const mockUpdateState = vi.fn();

const wrapper = ({ children }: any) => (
  <switchAccountSessionContext.Provider
    value={{
      close: vi.fn(),
      isOpen: false,
      open: vi.fn(),
      updateState: mockUpdateState,
    }}
  >
    {children}
  </switchAccountSessionContext.Provider>
);

describe('useIsParentTokenExpired', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not mark parent token as expired if it is valid', async () => {
    queryMocks.isParentTokenValid.mockReturnValue(true);
    const { result } = renderHook(
      () => useIsParentTokenExpired({ isProxyUser: true }),
      { wrapper }
    );

    expect(result.current.isParentTokenExpired).toBe(false);
  });

  it('should mark parent token as expired if it is invalid', async () => {
    queryMocks.isParentTokenValid.mockReturnValue(false);
    const { result } = renderHook(
      () => useIsParentTokenExpired({ isProxyUser: true }),
      { wrapper }
    );

    expect(result.current.isParentTokenExpired).toBe(true);
  });

  it('should not update the session context when isParentTokenExpired is false', async () => {
    queryMocks.isParentTokenValid.mockReturnValue(true);
    renderHook(() => useIsParentTokenExpired({ isProxyUser: true }), {
      wrapper,
    });

    expect(mockUpdateState).not.toHaveBeenCalled();
  });
});
