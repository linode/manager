import { renderHook } from '@testing-library/react';

import { useIsNATGatewaysEnabled } from './utils';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
}));

const flagMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

vi.mock('src/hooks/useFlags', () => ({
  useFlags: flagMocks.useFlags,
}));

describe('useIsNATGatewaysEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when account has NAT Gateway capability and flag is enabled (beta)', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NAT Gateway'],
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: true,
        enabled: true,
        ga: false,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: true,
      isNATGatewaysBeta: true,
    });
  });

  it('returns true when account has NAT Gateway capability and flag is enabled (GA)', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NAT Gateway'],
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: false,
        enabled: true,
        ga: true,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: true,
      isNATGatewaysBeta: false,
    });
  });

  it('returns true when account has NAT Gateway capability and both beta and GA flags are enabled', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NAT Gateway'],
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: true,
        enabled: true,
        ga: true,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: true,
      isNATGatewaysBeta: true,
    });
  });

  it('returns false when account has NAT Gateway capability but flag is not enabled', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NAT Gateway'],
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: true,
        enabled: false,
        ga: false,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: false,
      isNATGatewaysBeta: true,
    });
  });

  it('returns false when account does not have NAT Gateway capability', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: [],
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: true,
        enabled: true,
        ga: false,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: false,
      isNATGatewaysBeta: true,
    });
  });

  it('returns false when account data is undefined', () => {
    queryMocks.useAccount.mockReturnValue({
      data: undefined,
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: true,
        enabled: true,
        ga: false,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: false,
      isNATGatewaysBeta: true,
    });
  });

  it('returns false when account capabilities are undefined', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: undefined,
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: true,
        enabled: true,
        ga: false,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: false,
      isNATGatewaysBeta: true,
    });
  });

  it('returns false when flag data is undefined', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NAT Gateway'],
      },
    });

    flagMocks.useFlags.mockReturnValue({});

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: false,
      isNATGatewaysBeta: false,
    });
  });

  it('returns false for isNATGatewaysBeta when beta flag is undefined', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['NAT Gateway'],
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        enabled: true,
        ga: true,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: true,
      isNATGatewaysBeta: false,
    });
  });

  it('handles account with other capabilities but not NAT Gateway', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
      },
    });

    flagMocks.useFlags.mockReturnValue({
      natgateway: {
        beta: true,
        enabled: true,
        ga: false,
      },
    });

    const { result } = renderHook(() => useIsNATGatewaysEnabled());
    expect(result.current).toStrictEqual({
      isNATGatewaysEnabled: false,
      isNATGatewaysBeta: true,
    });
  });
});
