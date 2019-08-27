import {
  convertMinutesTo,
  generateMigrationTimeString
} from './minute-conversion';

describe('Minute Conversion Utils', () => {
  it('should convert minutes to hours', () => {
    expect(convertMinutesTo(120, 'hours', true)).toBe('2,0');
    expect(convertMinutesTo(120, 'hours', false)).toBe('2');
    expect(convertMinutesTo(140, 'hours', true)).toBe('2,20');
    expect(convertMinutesTo(120, 'hours', false)).toBe('2');
    expect(convertMinutesTo(0, 'hours', false)).toBe('0');
  });

  it('should convert minutes to days', () => {
    expect(convertMinutesTo(1440, 'days', true)).toBe('1,0');
    expect(convertMinutesTo(1500, 'days', false)).toBe('1');
    expect(convertMinutesTo(1500, 'days', true)).toBe('1,60');
    expect(convertMinutesTo(2800, 'days', true)).toBe('1,1360');
    expect(convertMinutesTo(0, 'days', false)).toBe('0');
  });
});

describe('Human-Readable Minute Conversion', () => {
  it('should return days, hours, and minutes', () => {
    expect(generateMigrationTimeString(1440)).toBe(`1 day and 0 minutes`);
    expect(generateMigrationTimeString(1500)).toBe(
      `1 day, 1 hour, and 0 minutes`
    );
    expect(generateMigrationTimeString(2800)).toBe(
      `1 day, 22 hours, and 40 minutes`
    );
    expect(generateMigrationTimeString(0)).toBe(`0 minutes`);
    expect(generateMigrationTimeString(2820)).toBe(
      `1 day, 23 hours, and 0 minutes`
    );
    expect(generateMigrationTimeString(2880)).toBe(`2 days and 0 minutes`);
  });
});
