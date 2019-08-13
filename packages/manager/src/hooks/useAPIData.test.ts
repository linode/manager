import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useAPIData } from './useAPIData';

interface MockData {
  data: number[];
}

const mockError = [{ reason: 'An error occurred.' }];

const mockRequestSuccess = (): Promise<MockData> =>
  new Promise(resolve => resolve({ data: [1, 2, 3] }));

const mockRequestWithDep = (n: number) => (): Promise<MockData> =>
  new Promise(resolve => resolve({ data: [n] }));

const mockRequestFailure = (): Promise<MockData> =>
  new Promise((_, reject) => reject(mockError));

describe('useAPIData', () => {
  afterEach(cleanup);

  it('sets `data` on load', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAPIData<MockData>(mockRequestSuccess)
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual([1, 2, 3]);
  });

  it('executes request when dependencies change', async () => {
    let mockDep = 1;
    const { result, waitForNextUpdate, rerender } = renderHook(() =>
      useAPIData<MockData>(mockRequestWithDep(mockDep), [mockDep])
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
      useAPIData<MockData>(mockRequestFailure)
    );

    await waitForNextUpdate();

    expect(result.current.error).toEqual(mockError);
  });
});
