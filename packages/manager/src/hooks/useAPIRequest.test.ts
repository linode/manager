import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useAPIRequest } from './useAPIRequest';

const mockError = [{ reason: 'An error occurred.' }];

const mockRequestSuccess = (): Promise<number> =>
  new Promise(resolve => resolve(1));

const mockRequestWithDep = (n: number) => (): Promise<number> =>
  new Promise(resolve => resolve(n));

const mockRequestFailure = (): Promise<number> =>
  new Promise((_, reject) => reject(mockError));

describe('useAPIRequest', () => {
  afterEach(cleanup);

  it('sets `data` on load', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAPIRequest<number>(mockRequestSuccess, 0)
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual(1);
  });

  it('executes request when dependencies change', async () => {
    let mockDep = 1;
    const { result, waitForNextUpdate, rerender } = renderHook(() =>
      useAPIRequest<number>(mockRequestWithDep(mockDep), 0, [mockDep])
    );
    await waitForNextUpdate();
    const data1 = result.current.data;

    mockDep = 2;
    rerender();
    await waitForNextUpdate();
    const data2 = result.current.data;

    expect(data1).not.toEqual(data2);
  });

  it('sets error when request fails', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAPIRequest<number>(mockRequestFailure, 0)
    );

    await waitForNextUpdate();

    expect(result.current.error).toEqual(mockError);
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
