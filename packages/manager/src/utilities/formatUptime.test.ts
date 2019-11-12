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
      formatUptime(60 * 60 * 24 * 9 + 60 * 60 * 19 + 60 * 45 + 45)
    ).toMatch('9d 19h 45m');
  });
});
