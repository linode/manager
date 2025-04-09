import { describe, expect, it } from 'vitest';

import { Duration } from 'luxon';

import { formatUptime } from './formatUptime';

describe('Formatting uptime', () => {
  it('should output a string in the format Xd Yh Zm', () => {
    const value = 60 * 2 + 60 * 60 * 3 + 24;
    expect(formatUptime(value)).toMatch('3h 2m');
  });

  it('should handle small values', () => {
    expect(formatUptime(0)).toMatch('< 1 minute');
    expect(formatUptime(10)).toMatch('< 1 minute');
  });

  it('should handle minutes and seconds', () => {
    expect(formatUptime(60 * 4 + 30)).toMatch('4m 30s');
  });

  it('should handle hours, minutes, and seconds', () => {
    expect(formatUptime(60 * 60 * 3 + 60 * 2)).toMatch('3h 2m');
  });

  it('should handle days', () => {
    expect(formatUptime(60 * 60 * 24 * 7)).toMatch('7d 0h 0m');
  });

  it('should handle all the things', () => {
    expect(
      formatUptime(60 * 60 * 24 * 9 + 60 * 60 * 19 + 60 * 45 + 45),
    ).toMatch('9d 19h 45m');
  });

  it('should handle durations longer than a month', () => {
    expect(
      formatUptime(
        Duration.fromObject({ days: 438, hours: 10, minutes: 15 }).as(
          'seconds',
        ),
      ),
    ).toMatch('438d 10h 15m');
  });

  it('should ignore seconds for longer durations', () => {
    expect(
      formatUptime(
        Duration.fromObject({
          days: 438,
          hours: 8,
          minutes: 15,
          seconds: 54,
        }).as('seconds'),
      ),
    ).toMatch('438d 8h 15m');
  });
});
