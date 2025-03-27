import { renderHook } from '@testing-library/react';
import { useFormattedDate } from './useFormattedDate';
import { DateTime } from 'luxon';
import { describe, expect, it, vi } from 'vitest';

// Solution - 01
describe('useFormattedDate', () => {
  it('returns the correctly formatted date', () => {
    const { result } = renderHook(() => useFormattedDate());

    const expectedDate = DateTime.local().toFormat('yyyy-MM-dd');
    expect(result.current).toBe(expectedDate);
  });
});

// Solution - 02
describe('useFormattedDate', () => {
  it('returns the correctly formatted date', () => {
    const { result } = renderHook(() => useFormattedDate());

    const expectedDate = new Date().toISOString().split('T')[0];
    expect(result.current).toBe(expectedDate);
  });
});

// Solution - 03
vi.mock('luxon', () => ({
  DateTime: {
    local: vi.fn().mockReturnValue({
      toFormat: vi.fn().mockReturnValue('2025-03-27'),
    }),
  },
}));

describe('useFormattedDate', () => {
  it('returns the correctly formatted date', () => {
    const { result } = renderHook(() => useFormattedDate());

    expect(result.current).toBe('2025-03-27');
  });
});
