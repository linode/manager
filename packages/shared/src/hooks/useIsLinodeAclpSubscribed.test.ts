import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsLinodeAclpSubscribed } from './useIsLinodeAclpSubscribed';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

describe('useIsLinodeAclpSubscribed', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns false when linodeId is undefined', () => {
    queryMocks.useLinodeQuery.mockReturnValue({});

    const { result } = renderHook(() =>
      useIsLinodeAclpSubscribed(undefined, 'beta'),
    );

    expect(result.current).toBe(false);
  });

  it('returns false when linode data is undefined', () => {
    queryMocks.useLinodeQuery.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useIsLinodeAclpSubscribed(123, 'beta'));

    expect(result.current).toBe(false);
  });

  it('returns true in GA stage when no alerts exist at all', () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: {
        alerts: {
          cpu: 0,
          io: 0,
          network_in: 0,
          network_out: 0,
          transfer_quota: 0,
          system_alerts: [],
          user_alerts: [],
        },
      },
    });

    const { result } = renderHook(() => useIsLinodeAclpSubscribed(123, 'ga'));

    expect(result.current).toBe(true);
  });

  it('returns false in beta stage when no alerts exist at all', () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: {
        alerts: {
          cpu: 0,
          io: 0,
          network_in: 0,
          network_out: 0,
          transfer_quota: 0,
          system_alerts: [],
          user_alerts: [],
        },
      },
    });

    const { result } = renderHook(() => useIsLinodeAclpSubscribed(123, 'beta'));

    expect(result.current).toBe(false);
  });

  it('returns false when only legacy alerts exist', () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: {
        alerts: {
          cpu: 90,
          io: 0,
          network_in: 0,
          network_out: 0,
          transfer_quota: 0,
          system_alerts: [],
          user_alerts: [],
        },
      },
    });

    const { result } = renderHook(() => useIsLinodeAclpSubscribed(123, 'beta'));

    expect(result.current).toBe(false);
  });

  it('returns true when only ACLP alerts exist', () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: {
        alerts: {
          cpu: 0,
          io: 0,
          network_in: 0,
          network_out: 0,
          transfer_quota: 0,
          system_alerts: [100],
          user_alerts: [],
        },
      },
    });

    const { result } = renderHook(() => useIsLinodeAclpSubscribed(123, 'beta'));

    expect(result.current).toBe(true);
  });

  it('returns true when both legacy and ACLP alerts exist', () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: {
        alerts: {
          cpu: 90,
          io: 0,
          network_in: 0,
          network_out: 0,
          transfer_quota: 0,
          system_alerts: [100],
          user_alerts: [200],
        },
      },
    });

    const { result } = renderHook(() => useIsLinodeAclpSubscribed(123, 'beta'));

    expect(result.current).toBe(true);
  });
});
