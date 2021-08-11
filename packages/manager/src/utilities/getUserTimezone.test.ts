import getUserTimezone from './getUserTimezone';
import { DateTime } from 'luxon';
import { Profile } from '@linode/api-v4/lib/profile';
import { profileFactory } from 'src/factories/profile';

const mockProfile: Profile = profileFactory.build();

const setMockProfileTimezone = (setTimezone: any) => {
  mockProfile.timezone = setTimezone;
};

describe('getUserTimezone', () => {
  it('should handle a a real timezone', () => {
    setMockProfileTimezone('America/Phoenix');
    expect(getUserTimezone(mockProfile)).toBe('America/Phoenix');
  });
  it('should handle an empty string timezone', () => {
    setMockProfileTimezone('');
    expect(getUserTimezone(mockProfile)).toBe(DateTime.local().zoneName);
  });
  it('should handle a null timezone', () => {
    setMockProfileTimezone(null);
    expect(getUserTimezone(mockProfile)).toBe(DateTime.local().zoneName);
  });
  it('should handle an undefined timezone', () => {
    setMockProfileTimezone(undefined);
    expect(getUserTimezone(mockProfile)).toBe(DateTime.local().zoneName);
  });
});
