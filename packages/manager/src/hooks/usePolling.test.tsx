import { renderHook } from '@testing-library/react-hooks';
import usePolling from './usePolling';

jest.mock('./usePageVisibility', () => ({
  default: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
}));

const f1 = jest.fn();
const f2 = jest.fn();
const f3 = jest.fn();
const f4 = jest.fn();

jest.useFakeTimers();

describe('usePolling hook', () => {
  it('should start polling if the tab is visible', () => {
    renderHook(() => usePolling([f1, f2, f3, f4], 1000));
    jest.advanceTimersByTime(20001);
    expect(f1).toHaveBeenCalledTimes(20);
    expect(f2).toHaveBeenCalledTimes(20);
    expect(f3).toHaveBeenCalledTimes(20);
    expect(f4).toHaveBeenCalledTimes(20);
  });

  it('should stop polling if the tab becomes inactive', () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    renderHook(() => usePolling([f1, f2, f3, f4], 1000));
    jest.advanceTimersByTime(10001);
    expect(f1).not.toHaveBeenCalled();
    expect(f2).not.toHaveBeenCalled();
    expect(f3).not.toHaveBeenCalled();
    expect(f4).not.toHaveBeenCalled();
  });
});
