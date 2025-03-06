import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsNodebalancerVPCEnabled } from './utils';

describe('useIsNodebalancerVPCEnabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = { flags: { nodebalancerVpc: true } };

    const { result } = renderHook(() => useIsNodebalancerVPCEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isNodebalancerVPCEnabled).toBe(true);
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = { flags: { nodebalancerVpc: false } };

    const { result } = renderHook(() => useIsNodebalancerVPCEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isNodebalancerVPCEnabled).toBe(false);
    });
  });
});
