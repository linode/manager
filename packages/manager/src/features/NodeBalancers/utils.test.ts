import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  getBackendStatusIndicator,
  useIsNodebalancerIpv6Enabled,
  useIsNodebalancerVPCEnabled,
} from './utils';

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

describe('useIsNodebalancerIpv6Enabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = { flags: { nodebalancerIpv6: true } };

    const { result } = renderHook(() => useIsNodebalancerIpv6Enabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isNodebalancerIpv6Enabled).toBe(true);
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = { flags: { nodebalancerIpv6: false } };

    const { result } = renderHook(() => useIsNodebalancerIpv6Enabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isNodebalancerIpv6Enabled).toBe(false);
    });
  });
});

describe('getBackendStatusIndicator', () => {
  it.each([
    [
      'returns inactive when both values are undefined',
      undefined,
      undefined,
      'inactive',
    ],
    ['returns inactive when both values are zero', 0, 0, 'inactive'],
    [
      'returns active when there are no down backends and some up backends',
      3,
      0,
      'active',
    ],
    [
      'returns error when there are no up backends and some down backends',
      0,
      2,
      'error',
    ],
    ['returns other when both up and down backends are present', 2, 1, 'other'],
  ])('%s', (_name, up, down, expected) => {
    expect(getBackendStatusIndicator(up, down)).toBe(expected);
  });
});
