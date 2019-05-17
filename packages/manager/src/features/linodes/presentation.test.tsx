import { typeLabelDetails } from './presentation';

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
