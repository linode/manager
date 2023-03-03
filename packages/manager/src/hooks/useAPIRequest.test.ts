import { renderHook, waitFor } from '@testing-library/react';
import { useAPIRequest } from './useAPIRequest';

const mockError = [{ reason: 'An error occurred.' }];

const mockRequestSuccess = (): Promise<number> =>
  new Promise((resolve) => resolve(1));

const mockRequestWithDep = (n: number) => (): Promise<number> =>
  new Promise((resolve) => resolve(n));

const mockRequestFailure = (): Promise<number> =>
  new Promise((_, reject) => reject(mockError));

describe('useAPIRequest', () => {
  it('sets `data` on load', async () => {
    const { result } = renderHook(() =>
      useAPIRequest<number>(mockRequestSuccess, 0)
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(1);
    });
  });

  it('executes request when dependencies change', async () => {
    let mockDep = 1;
    const { result, rerender } = renderHook(() =>
      useAPIRequest<number>(mockRequestWithDep(mockDep), 0, [mockDep])
    );

    // intial value of 0
    expect(result.current.data).toBe(0);

    await waitFor(() => {
      expect(result.current.data).toBe(1);
    });

    mockDep = 2;

    rerender();

    await waitFor(() => {
      expect(result.current.data).toBe(2);
    });
  });

  it('sets error when request fails', async () => {
    const { result } = renderHook(() =>
      useAPIRequest<number>(mockRequestFailure, 0)
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });
  it('returns default state when the request is null', () => {
    const { result } = renderHook(() => useAPIRequest(null, []));
    const { loading, error, lastUpdated, data } = result.current;
    expect(loading).toBe(false);
    expect(error).toBeUndefined();
    expect(lastUpdated).toBe(0);
    expect(data).toEqual([]);
  });
});
