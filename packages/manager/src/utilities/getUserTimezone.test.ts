import getUserTimezone from './getUserTimezone';
import { DateTime } from 'luxon';
import { Profile } from '@linode/api-v4/lib/profile';

// @TODO use factory
const mockProfile: Profile = {
  authentication_type: 'password',
  authorized_keys: [],
  email: 'example-user@gmail.com',
  email_notifications: true,
  ip_whitelist_enabled: false,
  lish_auth_method: 'keys_only',
  referrals: {
    code: '871be32f49c1411b14f29f618aaf0c14637fb8d3',
    completed: 0,
    credit: 0,
    pending: 0,
    total: 0,
    url: 'https://www.linode.com/?r=871be32f49c1411b14f29f618aaf0c14637fb8d3',
  },
  restricted: false,
  timezone: 'US/Eastern',
  two_factor_auth: true,
  uid: 1234,
  username: 'exampleUser',
};

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
