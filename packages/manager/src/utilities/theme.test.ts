import {
  getNextThemeValue,
  getThemeFromPreferenceValue,
  isValidTheme,
} from './theme';

describe('getNextThemeValue', () => {
  it('should return light if current theme is dark', () => {
    expect(getNextThemeValue('dark')).toBe('light');
  });
  it('should return dark if the current theme is light', () => {
    expect(getNextThemeValue('light')).toBe('dark');
  });
  it('should return dark if the current theme is undefined', () => {
    expect(getNextThemeValue(undefined)).toBe('dark');
  });
});

describe('isValidTheme', () => {
  it('should return false if theme is not valid (string)', () => {
    expect(isValidTheme('OMG')).toBe(false);
  });
  it('should return false if theme is not valid (object)', () => {
    expect(isValidTheme({ omg: 'test' })).toBe(false);
  });
  it('should return false if theme is null', () => {
    expect(isValidTheme(null)).toBe(false);
  });
  it('should return false if theme is undefined', () => {
    expect(isValidTheme(undefined)).toBe(false);
  });
  it('should return false if theme is system (system is a valid preference option, but not a valid theme)', () => {
    expect(isValidTheme('system')).toBe(false);
  });
  it('should return true if theme is light', () => {
    expect(isValidTheme('light')).toBe(true);
  });
  it('should return true if theme is dark', () => {
    expect(isValidTheme('dark')).toBe(true);
  });
});

describe('getThemeFromPreferenceValue', () => {
  it('should return light if user has no theme preference and the system is NOT in dark mode', () => {
    expect(getThemeFromPreferenceValue(undefined, false)).toBe('light');
  });
  it('should return dark if user has no theme preference and the system is in dark mode', () => {
    expect(getThemeFromPreferenceValue(undefined, true)).toBe('dark');
  });
  it('should return dark if preferences says dark mode', () => {
    expect(getThemeFromPreferenceValue('dark', false)).toBe('dark');
  });
  it('should return light if preferences says light mode', () => {
    expect(getThemeFromPreferenceValue('dark', false)).toBe('dark');
  });
  it('should return light if preferences says system and system is in light mode', () => {
    expect(getThemeFromPreferenceValue('system', false)).toBe('light');
  });
  it('should return dark if preferences says system and system is in dark mode', () => {
    expect(getThemeFromPreferenceValue('system', true)).toBe('dark');
  });
  it('should default to light if some crazy preference value is passed', () => {
    expect(getThemeFromPreferenceValue({ omg: 'test' }, false)).toBe('light');
  });
});
