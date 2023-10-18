import { validatePassword } from './validatePassword';

describe('Password validation', () => {
  it('should return null if no password is provided', () => {
    expect(validatePassword(null as any)).toBe(null);
  });

  it('should return null for a valid root password', () => {
    expect(validatePassword('fdkj&34050ds2l2klfgF34*Djsd238SS')).toBe(null);
  });

  it('should return an error message for invalid passwords', () => {
    expect(validatePassword('password')).toMatch(
      'Password does not meet complexity requirements'
    );
  });
});
