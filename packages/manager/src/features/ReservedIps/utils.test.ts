import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsReserveIpEnabled } from './utils';

describe('useIsReserveIpEnabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = { flags: { reserveIp: true } };

    const { result } = renderHook(() => useIsReserveIpEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isReserveIpEnabled).toBe(true);
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = { flags: { reserveIp: false } };

    const { result } = renderHook(() => useIsReserveIpEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isReserveIpEnabled).toBe(false);
    });
  });
});
