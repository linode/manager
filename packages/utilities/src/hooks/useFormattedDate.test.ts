import { renderHook } from '@testing-library/react';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { useFormattedDate } from './useFormattedDate';

describe('useFormattedDate', () => {
  it('returns the correctly formatted date', () => {
    const { result } = renderHook(() => useFormattedDate());

    const expectedDate = DateTime.local().toFormat('yyyy-MM-dd');
    expect(result.current).toBe(expectedDate);
  });
});
