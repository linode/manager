import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  useIsAclpNbMetricsIntegrationEnabled,
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

describe('useIsAclpNbMetricsIntegrationEnabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = { flags: { aclpNbMetricsIntegration: true } };

    const { result } = renderHook(
      () => useIsAclpNbMetricsIntegrationEnabled(),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    await waitFor(() => {
      expect(result.current.isAclpNbMetricsIntegrationEnabled).toBe(true);
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = { flags: { aclpNbMetricsIntegration: false } };

    const { result } = renderHook(
      () => useIsAclpNbMetricsIntegrationEnabled(),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    await waitFor(() => {
      expect(result.current.isAclpNbMetricsIntegrationEnabled).toBe(false);
    });
  });
});
