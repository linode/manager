import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCleanupStaleValues } from './useCleanupStaleValues';

import type { Item } from '../../../constants';

const STALE_VALUE = 'stale-value';

const mockOptions: Item<string, string>[] = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
];

describe('useCleanupStaleValues - loading state', () => {
  it('should not call onChange when isLoading is true', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: STALE_VALUE,
        isLoading: true,
        multiple: false,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('useCleanupStaleValues - null or empty values', () => {
  it('should not call onChange when fieldValue is null', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: null,
        isLoading: false,
        multiple: false,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not call onChange when fieldValue is an empty array', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: [],
        isLoading: false,
        multiple: true,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not call onChange when fieldValue is an empty string', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: '',
        isLoading: false,
        multiple: false,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('useCleanupStaleValues - single selection mode', () => {
  it('should not call onChange when value is valid', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: 'opt1',
        isLoading: false,
        multiple: false,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should call onChange with null when value is not in options', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: STALE_VALUE,
        isLoading: false,
        multiple: false,
      })
    );

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should handle array fieldValue by using the first element', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: [STALE_VALUE],
        isLoading: false,
        multiple: false,
      })
    );

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should not call onChange when array fieldValue contains valid value', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: ['opt2'],
        isLoading: false,
        multiple: false,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should clear value when options no longer include it', () => {
    const onChange = vi.fn();

    const { rerender } = renderHook(
      ({ options }) =>
        useCleanupStaleValues({
          onChange,
          options,
          fieldValue: 'opt2',
          isLoading: false,
          multiple: false,
        }),
      { initialProps: { options: mockOptions } }
    );

    expect(onChange).not.toHaveBeenCalled();

    const newOptions: Item<string, string>[] = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 3', value: 'opt3' },
    ];

    rerender({ options: newOptions });

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('useCleanupStaleValues - multiple selection mode', () => {
  it('should not call onChange when all values are valid', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: ['opt1', 'opt2'],
        isLoading: false,
        multiple: true,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should filter out stale values from array', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: ['opt1', STALE_VALUE, 'opt2'],
        isLoading: false,
        multiple: true,
      })
    );

    expect(onChange).toHaveBeenCalledWith(['opt1', 'opt2']);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should handle comma-separated string values', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: `opt1,${STALE_VALUE},opt2`,
        isLoading: false,
        multiple: true,
      })
    );

    expect(onChange).toHaveBeenCalledWith('opt1,opt2');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange when all values are stale', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: ['stale1', 'stale2'],
        isLoading: false,
        multiple: true,
      })
    );

    expect(onChange).toHaveBeenCalledWith([]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should cleanup values when options are updated', () => {
    const onChange = vi.fn();

    const { rerender } = renderHook(
      ({ options }) =>
        useCleanupStaleValues({
          onChange,
          options,
          fieldValue: ['opt1', 'opt2'],
          isLoading: false,
          multiple: true,
        }),
      { initialProps: { options: mockOptions } }
    );

    expect(onChange).not.toHaveBeenCalled();

    const newOptions: Item<string, string>[] = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 3', value: 'opt3' },
    ];

    rerender({ options: newOptions });

    expect(onChange).toHaveBeenCalledWith(['opt1']);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('useCleanupStaleValues - edge cases', () => {
  it('should handle empty options array', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: [],
        fieldValue: 'opt1',
        isLoading: false,
        multiple: false,
      })
    );

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should not call onChange repeatedly on subsequent renders', () => {
    const onChange = vi.fn();

    const { rerender } = renderHook(() =>
      useCleanupStaleValues({
        onChange,
        options: mockOptions,
        fieldValue: ['opt1', 'opt2'],
        isLoading: false,
        multiple: true,
      })
    );

    expect(onChange).not.toHaveBeenCalled();

    rerender();
    rerender();
    rerender();

    expect(onChange).not.toHaveBeenCalled();
  });
});
