import {
  convertValueToUnit,
  formatToolTip,
  generateCurrentUnit,
  generateUnitByBaseUnit,
  generateUnitByBitValue,
  generateUnitByByteValue,
  generateUnitByTimeValue,
} from './unitConversion';

describe('Unit conversion', () => {
  it('should check current unit to be converted into appropriate unit', () => {
    expect(generateCurrentUnit('Bytes')).toBe('B');
    expect(generateCurrentUnit('%')).toBe('%');
  });

  it('should generate rolled up unit based on value', () => {
    expect(generateUnitByByteValue(2024)).toBe('KB');
    expect(generateUnitByBitValue(999)).toBe('b');
    expect(generateUnitByTimeValue(364000)).toBe('min');
  });

  it('should roll up value based on unit', () => {
    expect(convertValueToUnit(2048, 'KB')).toBe(2);
    expect(convertValueToUnit(3000000, 'Mb')).toBe(2.86);
    expect(convertValueToUnit(60000, 'min')).toBe(1);
  });

  it('should generate a tooltip', () => {
    expect(formatToolTip(1024, 'b')).toBe('1 Kb');
    expect(formatToolTip(2048, 'B')).toBe('2 KB');
    expect(formatToolTip(1000, 'ms')).toBe('1 s');
  });

  it('should generate maximum unit based on the base unit & value', () => {
    expect(generateUnitByBaseUnit(1000000, 'b')).toBe('Kb');
    expect(generateUnitByBaseUnit(2048, 'B')).toBe('KB');
    expect(generateUnitByBaseUnit(60001, 'ms')).toBe('min');
  });
});
