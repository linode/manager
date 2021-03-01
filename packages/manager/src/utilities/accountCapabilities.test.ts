import { isFeatureEnabled } from './accountCapabilities';

const isObjectStorageEnabled = isFeatureEnabled('Object Storage');

describe('isObjectStorageEnabled', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  describe('when "Object Storage EAP" is NOT in beta_programs...', () => {
    it("returns `false` when OBJ isn't enabled for the environment", () => {
      expect(isObjectStorageEnabled(false, [])).toBe(false);
      expect(isObjectStorageEnabled(false, ['Hello', 'World'] as any)).toBe(
        false
      );
    });

    it('returns `true` when OBJ is enabled for the environment', () => {
      expect(isObjectStorageEnabled(true, [])).toBe(true);
      expect(isObjectStorageEnabled(true, ['Hello', 'World'] as any)).toBe(
        true
      );
    });
  });

  describe('when "Object Storage EAP" IS in beta_programs', () => {
    it('returns `true` if OBJ is disabled for environment', () => {
      expect(isObjectStorageEnabled(false, ['Object Storage'])).toBe(true);
      expect(
        isObjectStorageEnabled(false, [
          'Hello',
          'World',
          'Object Storage',
        ] as any)
      ).toBe(true);
    });
    it('returns `true` if OBJ is enabled for environment', () => {
      expect(isObjectStorageEnabled(false, ['Object Storage'])).toBe(true);
      expect(
        isObjectStorageEnabled(false, [
          'Hello',
          'World',
          'Object Storage',
        ] as any)
      ).toBe(true);
    });
  });
});
