import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { parseAPIDate } from './date';
import { sortByUTFDate } from './sortByUTFDate';

vi.mock('./date', () => ({
  ...vi.importActual('./date'),
  parseAPIDate: vi.fn(),
}));

describe('sortByUTFDate', () => {
  beforeEach(() => {
    vi.mocked(parseAPIDate).mockImplementation((date: number | string) => {
      let date1;
      if (typeof date === 'string') {
        date1 = DateTime.fromISO(date, { zone: 'utc' });
      } else if (typeof date === 'number') {
        date1 = DateTime.fromMillis(date, { zone: 'utc' });
      }
      if (date1?.isValid) {
        return date1;
      }
      throw new Error(`invalid date format: ${date}`);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const dateUTF1 = '2024-03-14T15:30:00Z';
  const dateUTF2 = '2025-03-14T15:30:00Z';
  const invalidDate = 'invalid-date;';

  it('should sort dates in ascending order', () => {
    const result = sortByUTFDate(dateUTF1, dateUTF2, 'asc');

    // 2024 date should be earlier, so result should be negative
    expect(result).toBeLessThan(0);
  });

  it('should sort dates in descending order', () => {
    const result = sortByUTFDate(dateUTF1, dateUTF2, 'desc');

    // 2025 date should be later, so result should be positive
    expect(result).toBeGreaterThan(0);
  });

  it('should return 0 when both dates are the same', () => {
    const result = sortByUTFDate(dateUTF1, dateUTF1, 'asc');

    // Same date, should return 0
    expect(result).toBe(0);
  });

  it('should throw error for invalid dates', () => {
    expect(() => sortByUTFDate(invalidDate, dateUTF1, 'asc')).toThrowError(
      'invalid date format'
    );
  });
});
