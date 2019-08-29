import { generateTimeOfDay } from './ga';

describe('Utilty Functions', () => {
  it('should generate human-readable time of day', () => {
    expect(generateTimeOfDay(0)).toBe('Early Morning');
    expect(generateTimeOfDay(1)).toBe('Early Morning');
    expect(generateTimeOfDay(2)).toBe('Early Morning');
    expect(generateTimeOfDay(3)).toBe('Early Morning');
    expect(generateTimeOfDay(4)).toBe('Early Morning');
    expect(generateTimeOfDay(5)).toBe('Morning');
    expect(generateTimeOfDay(6)).toBe('Morning');
    expect(generateTimeOfDay(7)).toBe('Morning');
    expect(generateTimeOfDay(8)).toBe('Morning');
    expect(generateTimeOfDay(9)).toBe('Morning');
    expect(generateTimeOfDay(10)).toBe('Morning');
    expect(generateTimeOfDay(11)).toBe('Morning');
    expect(generateTimeOfDay(12)).toBe('Midday');
    expect(generateTimeOfDay(13)).toBe('Midday');
    expect(generateTimeOfDay(14)).toBe('Midday');
    expect(generateTimeOfDay(15)).toBe('Midday');
    expect(generateTimeOfDay(16)).toBe('Midday');
    expect(generateTimeOfDay(17)).toBe('Evening');
    expect(generateTimeOfDay(18)).toBe('Evening');
    expect(generateTimeOfDay(19)).toBe('Evening');
    expect(generateTimeOfDay(20)).toBe('Night');
    expect(generateTimeOfDay(21)).toBe('Night');
    expect(generateTimeOfDay(22)).toBe('Night');
    expect(generateTimeOfDay(23)).toBe('Night');
    expect(generateTimeOfDay(24)).toBe('Night');
    expect(generateTimeOfDay(-1)).toBe('Other');
    expect(generateTimeOfDay(25)).toBe('Other');
  });
});
