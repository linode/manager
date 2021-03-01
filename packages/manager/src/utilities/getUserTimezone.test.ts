import getUserTimezone from './getUserTimezone';
import { DateTime } from 'luxon';
import { defaultState } from 'src/store/index';

const mockState = defaultState;
const setMockState = (setTimezone: any) => {
  mockState.__resources.profile.data = {
    timezone: setTimezone,
    email: '',
    uid: 0,
    username: '',
    referrals: {
      code: '',
      url: '',
      total: 0,
      completed: 0,
      pending: 0,
      credit: 0,
    },
    email_notifications: false,
    ip_whitelist_enabled: false,
    lish_auth_method: 'disabled',
    authentication_type: 'password',
    authorized_keys: [],
    two_factor_auth: false,
    restricted: false,
  };
};

describe('getUserTimezone', () => {
  it('should handle a a real timezone', () => {
    setMockState('America/Phoenix');
    expect(getUserTimezone(mockState)).toBe('America/Phoenix');
  });
  it('should handle an empty string timezone', () => {
    setMockState('');
    expect(getUserTimezone(mockState)).toBe(DateTime.local().zoneName);
  });
  it('should handle a null timezone', () => {
    setMockState(null);
    expect(getUserTimezone(mockState)).toBe(DateTime.local().zoneName);
  });
  it('should handle an undefined timezone', () => {
    setMockState(undefined);
    expect(getUserTimezone(mockState)).toBe(DateTime.local().zoneName);
  });
});
