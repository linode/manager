import { nodeBalancerConfigNodeFactory } from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  getBackendStatusIndicator,
  parseAddress,
  parseAddresses,
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

describe('parseAddress', () => {
  it('parses an IPv4 address and port', () => {
    const node = nodeBalancerConfigNodeFactory.build({
      address: '192.168.0.1:80',
    });

    expect(parseAddress(node)).toStrictEqual({
      ...node,
      address: '192.168.0.1',
      port: '80',
    });
  });

  it('parses a VPC private (10.x) address and port', () => {
    const node = nodeBalancerConfigNodeFactory.build({
      address: '10.0.0.5:8080',
    });

    expect(parseAddress(node)).toStrictEqual({
      ...node,
      address: '10.0.0.5',
      port: '8080',
    });
  });

  it('parses a VPC private (172.16-31.x) address and port', () => {
    const node = nodeBalancerConfigNodeFactory.build({
      address: '172.16.1.2:443',
    });

    expect(parseAddress(node)).toStrictEqual({
      ...node,
      address: '172.16.1.2',
      port: '443',
    });
  });

  it('parses an IPv6 address and port', () => {
    const node = nodeBalancerConfigNodeFactory.build({
      address: '[2600:3c03::1]:80',
    });

    expect(parseAddress(node)).toStrictEqual({
      ...node,
      address: '2600:3c03::1',
      port: '80',
    });
  });

  it('returns the node unchanged when the address does not match a known pattern', () => {
    const node = nodeBalancerConfigNodeFactory.build({
      address: '8.8.8.8:53',
    });

    expect(parseAddress(node)).toStrictEqual(node);
  });
});

describe('parseAddresses', () => {
  it('parses each node in the list', () => {
    const nodes = [
      nodeBalancerConfigNodeFactory.build({ address: '192.168.0.1:80' }),
      nodeBalancerConfigNodeFactory.build({ address: '[2600:3c03::1]:8080' }),
    ];

    expect(parseAddresses(nodes)).toStrictEqual([
      { ...nodes[0], address: '192.168.0.1', port: '80' },
      { ...nodes[1], address: '2600:3c03::1', port: '8080' },
    ]);
  });
});
