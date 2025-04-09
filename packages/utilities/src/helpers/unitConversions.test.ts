import { describe, expect, it } from 'vitest';

import {
  ReadableBytesOptions,
  convertBytesToTarget,
  convertMegabytesTo,
  convertStorageUnit,
  readableBytes,
} from './unitConversions';

describe('conversion helper functions', () => {
  describe('readableBytes', () => {
    it('should return "0 bytes" if bytes === 0', () => {
      expect(readableBytes(0).formatted).toBe('0 bytes');
    });

    it("should handle negative values, unless it' disabled by the handleNegatives option", () => {
      expect(readableBytes(-123).formatted).toBe('-123 bytes');
      expect(readableBytes(-123).value).toBe(-123);
      expect(readableBytes(-1048576).formatted).toBe('-1 MB');
      expect(readableBytes(-1048576).value).toBe(-1);

      expect(
        readableBytes(-1048576, { handleNegatives: false }).formatted,
      ).toBe('0 bytes');
      expect(readableBytes(-0.5, { handleNegatives: false }).formatted).toBe(
        '0 bytes',
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
        '9.723 KB',
      );
      expect(readableBytes(1024 * 9.723, { round: { MB: 3 } }).formatted).toBe(
        '9.72 KB',
      );
      expect(
        readableBytes(1024 * 1024 * 143.22, { round: { MB: 2 } }).formatted,
      ).toBe('143.22 MB');
    });

    it("doesn't return units higher than the specific max unit", () => {
      expect(
        readableBytes(1024 * 1024 * 1024 * 50, { maxUnit: 'MB' }).formatted,
      ).toBe('51200 MB');
      expect(
        readableBytes(1024 * 1024 * 1024 * 50, { maxUnit: 'KB' }).formatted,
      ).toBe('52428800 KB');
      expect(
        readableBytes(1024 * 1024 * 1024 * 50, { maxUnit: 'bytes' }).formatted,
      ).toBe('53687091200 bytes');
    });

    it('returns the given unit if specified', () => {
      expect(
        readableBytes(1024 * 1024 * 1024 * 50, { unit: 'MB' }).formatted,
      ).toBe('51200 MB');
      expect(
        readableBytes(1024 * 1024 * 1024 * 50, { unit: 'GB' }).formatted,
      ).toBe('50 GB');
      expect(
        readableBytes(1024 * 1024 * 1024 * 50, { unit: 'TB' }).formatted,
      ).toBe('0.05 TB');
    });

    it('handles inputs that are <= 1', () => {
      expect(readableBytes(1).formatted).toBe('1 byte');
      expect(readableBytes(0.5).formatted).toBe('0.5 bytes');
      expect(readableBytes(-0.5).formatted).toBe('-0.5 bytes');
      expect(readableBytes(0.01, { maxUnit: 'bytes' }).formatted).toBe(
        '0.01 bytes',
      );
      expect(readableBytes(0.5, { unit: 'MB' }).formatted).toBe('0 MB');
      expect(readableBytes(0.3, { round: 0 }).formatted).toBe('0 bytes');
      expect(readableBytes(0.5, { round: 0 }).formatted).toBe('1 byte');
      expect(readableBytes(0.5, { round: 1 }).formatted).toBe('0.5 bytes');
      expect(readableBytes(0.05, { round: 1 }).formatted).toBe('0.1 bytes');
      expect(readableBytes(0.05, { round: 2 }).formatted).toBe('0.05 bytes');
    });

    it('returns 0 bytes if the input is invalid', () => {
      // This behavior is debatable. It's for potential situations where we mistakenly pass a
      // nun-number value to readableBytes (something we didn't handle/expect from the API, etc.).
      // Before adding this behavior, we were displaying "NaN bytes" in these situations. We could
      // throw an error and let consumers handle each case (or display an error message) but this
      // seemed the most straightforward path to me.
      expect(readableBytes(undefined as any).value).toBe(0);
      expect(readableBytes(undefined as any).formatted).toBe('0 bytes');
      expect(readableBytes('invalid' as any).formatted).toBe('0 bytes');
      expect(readableBytes({} as any).formatted).toBe('0 bytes');
    });

    it('allows custom unit labels', () => {
      const unitLabels: ReadableBytesOptions['unitLabels'] = {
        GB: 'Gigabytes',
        KB: 'Kilobytes',
        MB: 'Megabytes',
        TB: 'Terabytes',
        bytes: 'B',
      };
      expect(readableBytes(1, { unitLabels }).unit).toBe('B');
      expect(readableBytes(1024, { unitLabels }).unit).toBe('Kilobytes');
      expect(readableBytes(1048576, { unitLabels }).unit).toBe('Megabytes');
      expect(readableBytes(1073741824, { unitLabels }).unit).toBe('Gigabytes');
      expect(readableBytes(1073741824 * 10000, { unitLabels }).unit).toBe(
        'Terabytes',
      );
    });

    it('only affects values with custom labels that have been specified', () => {
      const unitLabels: ReadableBytesOptions['unitLabels'] = {
        bytes: 'B',
      };
      // Custom unit label:
      expect(readableBytes(1, { unitLabels }).unit).toBe('B');
      // Default unit label (not affected):
      expect(readableBytes(1024, { unitLabels }).unit).toBe('KB');
    });

    it('correctly pluralizes "bytes"', () => {
      expect(readableBytes(1).unit).toBe('byte');
      expect(readableBytes(1).formatted).toBe('1 byte');
      expect(readableBytes(-1).unit).toBe('byte');
      expect(readableBytes(-1).formatted).toBe('-1 byte');
      expect(readableBytes(2).unit).toBe('bytes');
      expect(readableBytes(2).formatted).toBe('2 bytes');
    });

    it('handles base 10 when the option is given', () => {
      expect(readableBytes(1000, { base10: true }).formatted).toBe('1 KB');
      expect(readableBytes(1000 * 1000, { base10: true }).formatted).toBe(
        '1 MB',
      );
      expect(
        readableBytes(1000 * 1000 * 1000, { base10: true }).formatted,
      ).toBe('1 GB');
    });
  });

  describe('convertBytesToTarget', () => {
    it('should convert bytes to kilobytes correctly', () => {
      expect(convertBytesToTarget('KB', 1024)).toBe(1);
      expect(convertBytesToTarget('KB', 5 * 1024)).toBe(5);
    });

    it('should convert bytes to megabytes', () => {
      expect(convertBytesToTarget('MB', 5 * 1024 * 1024)).toBe(5);
    });

    it("should return value unchanged if unit is 'bytes'", () => {
      expect(convertBytesToTarget('bytes', 1919)).toBe(1919);
    });

    it('should convert to gigabytes correctly', () => {
      expect(convertBytesToTarget('GB', 2 * 1024 * 1024 * 1024)).toBe(2);
    });
  });

  describe('convertStorageUnit', () => {
    const base = 1024;

    // Bytes
    it('should convert bytes to bytes', () => {
      expect(convertStorageUnit('B', 5 * Math.pow(base, 0), 'B')).toBe(5);
    });

    it('should convert bytes to kilobytes', () => {
      expect(convertStorageUnit('B', 5 * Math.pow(base, 1), 'KB')).toBe(5);
    });

    it('should convert bytes to megabytes', () => {
      expect(convertStorageUnit('B', 5 * Math.pow(base, 2), 'MB')).toBe(5);
    });

    it('should convert bytes to gigabytes', () => {
      expect(convertStorageUnit('B', 5 * Math.pow(base, 3), 'GB')).toBe(5);
    });

    it('should convert bytes to terabytes', () => {
      expect(convertStorageUnit('B', 5 * Math.pow(base, 4), 'TB')).toBe(5);
    });

    // Kilobytes
    it('should convert kilobytes to kilobytes', () => {
      expect(convertStorageUnit('KB', 5 * Math.pow(base, 0), 'KB')).toBe(5);
    });

    it('should convert kilobytes to meagabytes', () => {
      expect(convertStorageUnit('KB', 5 * Math.pow(base, 1), 'MB')).toBe(5);
    });

    it('should convert kilobytes to gigabytes', () => {
      expect(convertStorageUnit('KB', 5 * Math.pow(base, 2), 'GB')).toBe(5);
    });

    it('should convert kilobytes to terabytes', () => {
      expect(convertStorageUnit('KB', 5 * Math.pow(base, 3), 'TB')).toBe(5);
    });

    it('should convert kilobytes to bytes', () => {
      expect(convertStorageUnit('KB', 5, 'B')).toBe(5 * Math.pow(base, 1));
    });

    // Megabytes
    it('should convert megabytes to megabytes', () => {
      expect(convertStorageUnit('MB', 5 * Math.pow(base, 0), 'MB')).toBe(5);
    });

    it('should convert megabytes to gigabytes', () => {
      expect(convertStorageUnit('MB', 5 * Math.pow(base, 1), 'GB')).toBe(5);
    });

    it('should convert megabytes to terabytes', () => {
      expect(convertStorageUnit('MB', 5 * Math.pow(base, 2), 'TB')).toBe(5);
    });

    it('should convert megabytes to kilobytes', () => {
      expect(convertStorageUnit('MB', 5, 'KB')).toBe(5 * Math.pow(base, 1));
    });

    it('should convert megabytes to bytes', () => {
      expect(convertStorageUnit('MB', 5, 'B')).toBe(5 * Math.pow(base, 2));
    });

    // Gigabytes
    it('should convert gigabytes to gigabytes', () => {
      expect(convertStorageUnit('GB', 5 * Math.pow(base, 0), 'GB')).toBe(5);
    });

    it('should convert gigabytes to terabytes', () => {
      expect(convertStorageUnit('GB', 5 * Math.pow(base, 1), 'TB')).toBe(5);
    });

    it('should convert gigabytes to megabytes', () => {
      expect(convertStorageUnit('GB', 5, 'MB')).toBe(5 * Math.pow(base, 1));
    });

    it('should convert gigabytes to kilobytes', () => {
      expect(convertStorageUnit('GB', 5, 'KB')).toBe(5 * Math.pow(base, 2));
    });

    it('should convert gigabytes to bytes', () => {
      expect(convertStorageUnit('GB', 5, 'B')).toBe(5 * Math.pow(base, 3));
    });

    // Terabytes
    it('should convert terabytes to terabytes', () => {
      expect(convertStorageUnit('TB', 5 * Math.pow(base, 0), 'TB')).toBe(5);
    });

    it('should convert terabytes to gigabytes', () => {
      expect(convertStorageUnit('TB', 5, 'GB')).toBe(5 * Math.pow(base, 1));
    });

    it('should convert gigabytes to megabytes', () => {
      expect(convertStorageUnit('TB', 5, 'MB')).toBe(5 * Math.pow(base, 2));
    });

    it('should convert gigabytes to kilobytes', () => {
      expect(convertStorageUnit('TB', 5, 'KB')).toBe(5 * Math.pow(base, 3));
    });

    it('should convert gigabytes to bytes', () => {
      expect(convertStorageUnit('TB', 5, 'B')).toBe(5 * Math.pow(base, 4));
    });
  });

  describe('convertMegabytesTo', () => {
    const oneByteInMegabytes = Number.parseFloat('9.5367431640625e-7');
    const oneKilobyteInMegabytes = 0.0009765625;
    const oneGigabyteInMegabytes = 1024;
    const rationalGigabyteQuantity = 1377.28;
    const rationalKilobyteQuantity = 0.0013134765625;

    it('should convert megabytes to bytes', () => {
      expect(convertMegabytesTo(oneByteInMegabytes)).toBe('1 bytes');
    });

    it('should convert megabytes to kilobytes', () => {
      expect(convertMegabytesTo(oneKilobyteInMegabytes)).toBe('1.00 KB');
    });

    it('should convert megabytes to gigabytes', () => {
      expect(convertMegabytesTo(oneGigabyteInMegabytes)).toBe('1.00 GB');
    });

    it('should only return whole numbers when the removeDecimals argument is passed when the result is measured in gigabytes', () => {
      expect(convertMegabytesTo(oneGigabyteInMegabytes, true)).toBe('1 GB');
    });

    it('should return two decimals of precision for quantities between whole numbers', () => {
      expect(convertMegabytesTo(rationalKilobyteQuantity)).toBe('1.34 KB');
      expect(convertMegabytesTo(rationalGigabyteQuantity)).toBe('1.34 GB');
    });
  });
});
