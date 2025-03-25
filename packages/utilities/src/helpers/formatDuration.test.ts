import { describe, expect, it } from 'vitest';

import { Duration } from 'luxon';

import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('formats days to hours and minutes', () => {
    const dur = Duration.fromObject({
      days: 2,
      hours: 1,
      minutes: 1,
      seconds: 20,
    });
    expect(formatDuration(dur)).toBe('49 hours, 1 minute');
  });
  it('format days in hours and minutes rounds minutes up if >=30 secs', () => {
    const dur = Duration.fromObject({
      days: 2,
      hours: 1,
      minutes: 1,
      seconds: 31,
    });
    expect(formatDuration(dur)).toBe('49 hours, 2 minutes');
  });
  it('formats minutes to minutes and seconds', () => {
    const dur = Duration.fromObject({
      milliseconds: 300,
      minutes: 5,
      seconds: 1,
    });
    expect(formatDuration(dur)).toBe('5 minutes, 1 second');
  });
  it('format minutes to minutes and seconds up if >=500 msecs', () => {
    const dur = Duration.fromObject({
      milliseconds: 600,
      minutes: 5,
      seconds: 1,
    });
    expect(formatDuration(dur)).toBe('5 minutes, 2 seconds');
  });
  it('format seconds in seconds', () => {
    const dur = Duration.fromObject({
      milliseconds: 400,
      seconds: 1,
    });
    expect(formatDuration(dur)).toBe('1 second');
  });
  it('format seconds in seconds and rounds up if >= 500msecs', () => {
    const dur = Duration.fromObject({
      milliseconds: 600,
      seconds: 1,
    });
    expect(formatDuration(dur)).toBe('2 seconds');
  });
});
