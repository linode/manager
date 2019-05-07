import { readableBytes } from './unitConversions';

describe('readableBytes', () => {
  it('should return "0 B" if bytes === 0', () => {
    expect(readableBytes(0).formatted).toBe('0 bytes');
  });

  it('should return B if < 1024', () => {
    expect(readableBytes(1023).formatted).toBe('1023 B');
  });

  it('handles KB, MB, GB', () => {
    expect(readableBytes(1024).formatted).toBe('1 KB');
    expect(readableBytes(1048576).formatted).toBe('1 MB');
    expect(readableBytes(1073741824).formatted).toBe('1 GB');
    expect(readableBytes(1073741824 * 40).formatted).toBe('40 GB');
  });

  it('returns results with two decimal places if x < 10', () => {
    expect(readableBytes(1024 * 1.5).formatted).toBe('1.5 KB');
    expect(readableBytes(1024 * 1.75).formatted).toBe('1.75 KB');
  });

  it('returns results with one decimal place if 10 >= x < 100', () => {
    expect(readableBytes(1024 * 12.75).formatted).toBe('12.8 KB');
  });

  it('returns results rounded to whole number if x >= 100', () => {
    expect(readableBytes(1024 * 100).formatted).toBe('100 KB');
    expect(readableBytes(1024 * 100.25).formatted).toBe('100 KB');
    expect(readableBytes(1024 * 100.5).formatted).toBe('101 KB');
  });
});
