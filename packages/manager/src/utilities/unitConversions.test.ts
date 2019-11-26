import { readableBytes, ReadableBytesOptions } from './unitConversions';

describe('readableBytes', () => {
  it('should return "0 bytes" if bytes === 0', () => {
    expect(readableBytes(0).formatted).toBe('0 bytes');
  });

  it("should handle negative values, unless it' disabled by the handleNegatives option", () => {
    expect(readableBytes(-123).formatted).toBe('-123 bytes');
    expect(readableBytes(-123).value).toBe(-123);
    expect(readableBytes(-1048576).formatted).toBe('-1 MB');
    expect(readableBytes(-1048576).value).toBe(-1);

    expect(readableBytes(-1048576, { handleNegatives: false }).formatted).toBe(
      '0 bytes'
    );
    expect(readableBytes(-0.5, { handleNegatives: false }).formatted).toBe(
      '0 bytes'
    );
  });

  it('should return B if < 1024', () => {
    expect(readableBytes(1023).formatted).toBe('1023 bytes');
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

  it('respects rounding when specified with number', () => {
    const round0 = { round: 0 };
    const round1 = { round: 1 };
    const round2 = { round: 2 };

    expect(readableBytes(1024 * 9.72, round0).formatted).toBe('10 KB');
    expect(readableBytes(1024 * 9.72, round1).formatted).toBe('9.7 KB');
    expect(readableBytes(1024 * 9.72, round2).formatted).toBe('9.72 KB');

    expect(readableBytes(1024 * 89.99, round0).formatted).toBe('90 KB');
    expect(readableBytes(1024 * 89.99, round1).formatted).toBe('90 KB');
    expect(readableBytes(1024 * 89.99, round2).formatted).toBe('89.99 KB');

    expect(readableBytes(1024 * 100.25, round0).formatted).toBe('100 KB');
    expect(readableBytes(1024 * 100.25, round1).formatted).toBe('100.3 KB');
    expect(readableBytes(1024 * 100.25, round2).formatted).toBe('100.25 KB');
  });

  it('respects rounding when given specific units', () => {
    expect(readableBytes(1024 * 9.723, { round: { KB: 3 } }).formatted).toBe(
      '9.723 KB'
    );
    expect(readableBytes(1024 * 9.723, { round: { MB: 3 } }).formatted).toBe(
      '9.72 KB'
    );
    expect(
      readableBytes(1024 * 1024 * 143.22, { round: { MB: 2 } }).formatted
    ).toBe('143.22 MB');
  });

  it("doesn't return units higher than the specific max unit", () => {
    expect(
      readableBytes(1024 * 1024 * 1024 * 50, { maxUnit: 'MB' }).formatted
    ).toBe('51200 MB');
    expect(
      readableBytes(1024 * 1024 * 1024 * 50, { maxUnit: 'KB' }).formatted
    ).toBe('52428800 KB');
    expect(
      readableBytes(1024 * 1024 * 1024 * 50, { maxUnit: 'bytes' }).formatted
    ).toBe('53687091200 bytes');
  });

  it('returns the given unit if specified', () => {
    expect(
      readableBytes(1024 * 1024 * 1024 * 50, { unit: 'MB' }).formatted
    ).toBe('51200 MB');
    expect(
      readableBytes(1024 * 1024 * 1024 * 50, { unit: 'GB' }).formatted
    ).toBe('50 GB');
    expect(
      readableBytes(1024 * 1024 * 1024 * 50, { unit: 'TB' }).formatted
    ).toBe('0.05 TB');
  });

  it('handles inputs that are <= 1', () => {
    expect(readableBytes(1).formatted).toBe('1 bytes');
    expect(readableBytes(0.5).formatted).toBe('0.5 bytes');
    expect(readableBytes(-0.5).formatted).toBe('-0.5 bytes');
    expect(readableBytes(0.01, { maxUnit: 'bytes' }).formatted).toBe(
      '0.01 bytes'
    );
    expect(readableBytes(0.5, { unit: 'MB' }).formatted).toBe('0 MB');
    expect(readableBytes(0.3, { round: 0 }).formatted).toBe('0 bytes');
    expect(readableBytes(0.5, { round: 0 }).formatted).toBe('1 bytes');
    expect(readableBytes(0.5, { round: 1 }).formatted).toBe('0.5 bytes');
    expect(readableBytes(0.05, { round: 1 }).formatted).toBe('0.1 bytes');
    expect(readableBytes(0.05, { round: 2 }).formatted).toBe('0.05 bytes');
  });

  it('allows custom unit labels', () => {
    const unitLabels: ReadableBytesOptions['unitLabels'] = {
      bytes: 'B',
      KB: 'Kilobytes',
      MB: 'Megabytes',
      GB: 'Gigabytes',
      TB: 'Terabytes'
    };
    expect(readableBytes(1, { unitLabels }).unit).toBe('B');
    expect(readableBytes(1024, { unitLabels }).unit).toBe('Kilobytes');
    expect(readableBytes(1048576, { unitLabels }).unit).toBe('Megabytes');
    expect(readableBytes(1073741824, { unitLabels }).unit).toBe('Gigabytes');
    expect(readableBytes(1073741824 * 10000, { unitLabels }).unit).toBe(
      'Terabytes'
    );
  });

  it('only affects values with custom labels that have been specified', () => {
    const unitLabels: ReadableBytesOptions['unitLabels'] = {
      bytes: 'B'
    };
    // Custom unit label:
    expect(readableBytes(1, { unitLabels }).unit).toBe('B');
    // Default unit label (not affected):
    expect(readableBytes(1024, { unitLabels }).unit).toBe('KB');
  });
});
