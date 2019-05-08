const mockTrue = { isObjectStorageEnabledForEnvironment: true };
const mockFalse = { isObjectStorageEnabledForEnvironment: false };

describe('isObjectStorageEnabled', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  describe('when "Object Storage EAP" is NOT in beta_programs...', () => {
    it("returns `false` when OBJ isn't enabled for the environment", () => {
      // Since `isObjectStorageEnabledForEnvironment` is a global constant that
      // the isObjectStorageEnabled() helper consumes, it needs to be mocked from
      // constants.ts, and the helper function needs to be imported for each test.
      jest.mock('src/constants', () => mockFalse);
      const { isObjectStorageEnabled } = require('./betaPrograms');
      expect(isObjectStorageEnabled([])).toBe(false);
      expect(isObjectStorageEnabled(['Hello', 'World'])).toBe(false);
    });

    it('returns `true` when OBJ is enabled for the environment', () => {
      jest.mock('src/constants', () => mockTrue);
      const { isObjectStorageEnabled } = require('./betaPrograms');
      expect(isObjectStorageEnabled([])).toBe(true);
      expect(isObjectStorageEnabled(['Hello', 'World'])).toBe(true);
    });
  });

  describe('when "Object Storage EAP" IS in beta_programs', () => {
    it('returns `true` if OBJ is disabled for environment', () => {
      jest.mock('src/constants', () => mockFalse);
      const { isObjectStorageEnabled } = require('./betaPrograms');
      expect(isObjectStorageEnabled(['Object Storage EAP'])).toBe(true);
      expect(
        isObjectStorageEnabled(['Hello', 'World', 'Object Storage EAP'])
      ).toBe(true);
    });
    it('returns `true` if OBJ is enabled for environment', () => {
      jest.mock('src/constants', () => mockFalse);
      const { isObjectStorageEnabled } = require('./betaPrograms');
      expect(isObjectStorageEnabled(['Object Storage EAP'])).toBe(true);
      expect(
        isObjectStorageEnabled(['Hello', 'World', 'Object Storage EAP'])
      ).toBe(true);
    });
  });
});
