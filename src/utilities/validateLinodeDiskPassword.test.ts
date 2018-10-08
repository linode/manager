import { validateLinodeDiskPassword } from './validateLinodeDiskPassword';

describe('linode disk password validation', () => {
  it('should fail when password < 8 characters', () => {
    expect(validateLinodeDiskPassword('hello').isValid).toBe(false);
  });

  it('should fail when password > 128 characters', () => {
    expect(validateLinodeDiskPassword('He!!0'.repeat(30)).isValid).toBe(false);
  });

  it('should fail when not all character case conditions are met', () => {
    expect(validateLinodeDiskPassword('helloworld').isValid).toBe(false);
    expect(validateLinodeDiskPassword('HELLOWORLD').isValid).toBe(false);
    expect(validateLinodeDiskPassword('11111111').isValid).toBe(false);
    expect(validateLinodeDiskPassword('!!!!!!!!').isValid).toBe(false);
  });

  it('should succeed when two of four conditions are met', () => {
    expect(validateLinodeDiskPassword('helloworldA').isValid).toBe(true);
    expect(validateLinodeDiskPassword('helloworld!').isValid).toBe(true);
    expect(validateLinodeDiskPassword('helloworld0').isValid).toBe(true);
    expect(validateLinodeDiskPassword('HELLOWORLD!').isValid).toBe(true);
    expect(validateLinodeDiskPassword('HELLOWORLD0').isValid).toBe(true);
    expect(validateLinodeDiskPassword('1111111111#').isValid).toBe(true);
  });

  it('handles edge cases', () => {
    expect(validateLinodeDiskPassword('').isValid).toBe(false);
    expect(validateLinodeDiskPassword(' ').isValid).toBe(false);
  });
});
