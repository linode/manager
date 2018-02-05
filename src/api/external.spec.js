import { fullyLoadedObject } from './external';

describe('externals', () => {
  describe('fullyLoadedObject', () => {
    it('should return TRUE if no _name properties are found', () => {
      const result = fullyLoadedObject({
        something: {},
      });
      expect(result).toEqual(true);
    });

    it('should return FALSE if _name properties are found', () => {
      const result = fullyLoadedObject({ _something: {} });
      expect(result).toEqual(false);
    });
  });
});
