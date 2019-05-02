import { displayTypeForKubePoolNode, typeLabelDetails } from './presentation';

describe('Linode presentation helpers', () => {
  describe('type label details', () => {
    it('should return a string with memory, disk, and cpu details', () => {
      const typedLabel = typeLabelDetails(2048, 2048, 1);
      expect(typedLabel).toBe('1 CPU, 2GB Storage, 2GB RAM');
    });

    it('should return storage in GB', () => {
      const typedLabel = typeLabelDetails(1024, 2048, 1);
      expect(typedLabel.includes('2GB Storage'));
    });

    it('should return memory in GB', () => {
      const typedLabel = typeLabelDetails(1024, 2048, 1);
      expect(typedLabel.includes('1GB Ram'));
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

  describe('Display for Kube pool nodes', () => {
    it('should return a string with heading, size, and CPUs', () => {
      expect(displayTypeForKubePoolNode('standard', 4096, 2)).toEqual(
        'Standard 4GB, 2 CPUs'
      );
    });

    it('should pluralize CPUs correctly', () => {
      expect(displayTypeForKubePoolNode('standard', 2048, 1)).toEqual(
        'Standard 2GB, 1 CPU'
      );
    });

    it('should format highmem instances', () => {
      expect(displayTypeForKubePoolNode('highmem', 2048, 1)).toEqual(
        'High Memory 2GB, 1 CPU'
      );
    });
  });
});
