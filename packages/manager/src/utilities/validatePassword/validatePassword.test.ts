import { validatePassword } from './validatePassword';

describe('Password validation', () => {
  it('should return null if validation is set to none', () => {
    expect(validatePassword('none', 'badpassword')).toBe(null);
  });

  it('should return null for a valid root password', () => {
    expect(validatePassword('length', 'long!!secure!!pa$$word!')).toBe(null);
    expect(
      validatePassword('complexity', 'fdkj&34050ds2l2klfgF34*Djsd238SS')
    ).toBe(null);
  });

  it('should return an error message for invalid passwords', () => {
    expect(validatePassword('length', 'short')).toMatch(
      'Password must be between 6 and 128 characters'
    );

    expect(validatePassword('length', 'longbutjustletters')).toMatch(
      'Password must contain at least 2 of the following classes: uppercase letters, lowercase letters, numbers, and punctuation'
    );

    expect(validatePassword('complexity', 'password')).toMatch(
      'Password does not meet complexity requirements'
    );
  });
});
