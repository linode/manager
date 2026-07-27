import {
  getNextThemeValue,
  getStoredThemePreference,
  getThemeFromPreferenceValue,
  isValidTheme,
  isValidThemeChoice,
  setStoredThemePreference,
  THEME_PREFERENCE_STORAGE_KEY,
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

describe('theme preference localStorage', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns undefined when nothing is stored', () => {
    expect(getStoredThemePreference()).toBeUndefined();
  });

  it('reads and writes a valid theme preference', () => {
    setStoredThemePreference('dark');
    expect(store.get(THEME_PREFERENCE_STORAGE_KEY)).toBe('dark');
    expect(getStoredThemePreference()).toBe('dark');
  });

  it('ignores invalid stored values', () => {
    store.set(THEME_PREFERENCE_STORAGE_KEY, 'invalid');
    expect(getStoredThemePreference()).toBeUndefined();
  });

  it('validates theme choices', () => {
    expect(isValidThemeChoice('dark')).toBe(true);
    expect(isValidThemeChoice('light')).toBe(true);
    expect(isValidThemeChoice('system')).toBe(true);
    expect(isValidThemeChoice('invalid')).toBe(false);
  });
});
