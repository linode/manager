import { getCountryCodeFromSlug } from './MigrateLanding';

describe('Utility Functions', () => {
  it('should return the correct country code based on country slugs', () => {
    expect(getCountryCodeFromSlug('ap-west')).toBe('in');
    expect(getCountryCodeFromSlug('ca-central')).toBe('ca');
    expect(getCountryCodeFromSlug('us-central')).toBe('us');
    expect(getCountryCodeFromSlug('us-east')).toBe('us');
    expect(getCountryCodeFromSlug('us-west')).toBe('us');
    expect(getCountryCodeFromSlug('us-southeast')).toBe('us');
    expect(getCountryCodeFromSlug('eu-west')).toBe('uk');
    expect(getCountryCodeFromSlug('ap-south')).toBe('sg');
    expect(getCountryCodeFromSlug('eu-central')).toBe('de');
    expect(getCountryCodeFromSlug('ap-northeast')).toBe('jp');
    expect(getCountryCodeFromSlug('pppppppppp')).toBe('us');
  });
});
