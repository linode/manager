import {
  entityHasNeverBeenRequested,
  shouldRequestEntity,
} from './shouldRequestEntity';

const baseEntity = {
  itemsById: {},
  error: {},
  loading: false,
  lastUpdated: 0,
  results: 0,
};

describe('Entity request helper logic', () => {
  describe('shouldRequestEntity', () => {
    it('should handle an undefined entity', () => {
      expect(shouldRequestEntity(undefined as any)).toBe(true);
    });

    it('should return true for an entity that has never been requested', () => {
      expect(shouldRequestEntity(baseEntity)).toBe(true);
    });

    it('should return false for a loading entity', () => {
      expect(shouldRequestEntity({ ...baseEntity, loading: true })).toBe(false);
    });

    it("should return true for an entity that hasn't been requested in a long time", () => {
      expect(
        shouldRequestEntity({
          ...baseEntity,
          lastUpdated: Date.now() - 60 * 60 * 1000, // one hour
        })
      ).toBe(true);
    });

    it('should return false for an entity that has been requested recently', () => {
      expect(
        shouldRequestEntity({
          ...baseEntity,
          lastUpdated: Date.now() - 10000, // 10 seconds
        })
      ).toBe(false);
    });

    it('should accept a second argument to control the refresh interval', () => {
      expect(
        shouldRequestEntity(
          { ...baseEntity, lastUpdated: Date.now() - 500 },
          1000
        )
      ).toBe(false);
    });
  });

  describe('entityHasNeverBeenRequested', () => {
    it('should handle an undefined entity', () => {
      expect(entityHasNeverBeenRequested(undefined as any)).toBe(true);
    });

    it('should return true if not loading and lastUpdated is 0', () => {
      expect(entityHasNeverBeenRequested(baseEntity)).toBe(true);
    });

    it('should return false if loading is true', () => {
      expect(
        entityHasNeverBeenRequested({ ...baseEntity, loading: true })
      ).toBe(false);
    });

    it('should return false if lastUpdated is > 0', () => {
      expect(
        entityHasNeverBeenRequested({ ...baseEntity, lastUpdated: 7 })
      ).toBe(false);
    });
  });
});
