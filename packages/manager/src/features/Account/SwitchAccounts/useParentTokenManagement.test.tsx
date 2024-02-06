import { renderHook } from '@testing-library/react-hooks';
import * as React from 'react';

import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { useParentTokenManagement } from 'src/features/Account/SwitchAccounts/useParentTokenManagement';
import { isParentTokenValid } from 'src/features/Account/utils';

vi.mock('src/features/Account/utils', () => ({
  isParentTokenValid: vi.fn().mockReturnValue(true),
}));

const mockUpdateState = vi.fn();

const wrapper = ({ children }: any) => (
  <switchAccountSessionContext.Provider
    value={{
      close: vi.fn(),
      continueSession: false,
      isOpen: false,
      open: vi.fn(),
      updateState: mockUpdateState,
    }}
  >
    {children}
  </switchAccountSessionContext.Provider>
);

describe('useParentTokenManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not mark parent token as expired if it is valid', async () => {
    isParentTokenValid.mockReturnValue(true);
    const { result } = renderHook(
      () => useParentTokenManagement({ isProxyUser: true }),
      { wrapper }
    );

    expect(result.current.isParentTokenExpired).toBe(false);
  });

  it('should mark parent token as expired if it is invalid', async () => {
    isParentTokenValid.mockReturnValue(false);
    const { result } = renderHook(
      () => useParentTokenManagement({ isProxyUser: true }),
      { wrapper }
    );

    expect(result.current.isParentTokenExpired).toBe(true);
  });

  it('should update the session context when isParentTokenExpired is true and continueSession is false', async () => {
    isParentTokenValid.mockReturnValue(false);
    renderHook(() => useParentTokenManagement({ isProxyUser: true }), {
      wrapper,
    });

    expect(mockUpdateState).toHaveBeenCalledWith({
      continueSession: true,
      isOpen: true,
    });
  });

  it('should not update the session context when isParentTokenExpired is false', async () => {
    isParentTokenValid.mockReturnValue(true);
    renderHook(() => useParentTokenManagement({ isProxyUser: true }), {
      wrapper,
    });

    expect(mockUpdateState).not.toHaveBeenCalled();
  });
});
