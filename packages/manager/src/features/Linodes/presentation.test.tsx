import { typeLabelDetails } from './presentation';

describe('Linode presentation helpers', () => {
  describe('type label details', () => {
    it('should return a string with memory, disk, and cpu details', () => {
      const typedLabel = typeLabelDetails(2048, 2048, 1);
      expect(typedLabel).toBe('1 CPU, 2 GB Storage, 2 GB RAM');
    });

    it('should return storage in  GB', () => {
      const typedLabel = typeLabelDetails(1024, 2048, 1);
      expect(typedLabel.includes('2 GB Storage'));
    });

    it('should return memory in  GB', () => {
      const typedLabel = typeLabelDetails(1024, 2048, 1);
      expect(typedLabel.includes('1 GB Ram'));
    });

    it('should return number of CPUs', () => {
      const typedLabel = typeLabelDetails(1024, 2048, 4);
      expect(typedLabel.includes('4CPU'));
    });

    it('should return number of CPUs', () => {
      const typedLabel = typeLabelDetails(1024, 2048, 4);
      expect(typedLabel.includes('4CPU'));
    });
  });
});
