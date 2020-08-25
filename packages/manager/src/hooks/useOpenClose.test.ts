import { act, renderHook } from '@testing-library/react-hooks';
import { useOpenClose } from './useOpenClose';

describe('useOpenClose hook', () => {
  it('defaults "isOpen" property to false', () => {
    const { result } = renderHook(() => useOpenClose());
    expect(result.current.isOpen).toBe(false);
  });

  it('includes a "open" function which sets isOpen to true', () => {
    const { result } = renderHook(() => useOpenClose());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('includes a "close" function which sets isOpen to false', () => {
    const { result } = renderHook(() => useOpenClose());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });
});
