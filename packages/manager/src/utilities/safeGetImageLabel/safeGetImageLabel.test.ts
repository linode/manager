import { normalizedImages } from 'src/__data__/images';
import { safeGetImageLabel } from './safeGetImageLabel';

describe('safeGetImageLabel', () => {
  it('should return an empty string if no slug provided', () => {
    expect(safeGetImageLabel(normalizedImages, null)).toBe('');
  });

  it('should return "Unknown Image" if the slug does not exist in the image data', () => {
    expect(safeGetImageLabel(normalizedImages, 'duhhhhhhhhhh')).toBe(
      'Unknown Image'
    );
  });

  it('should return "Fedora 23"', () => {
    expect(safeGetImageLabel(normalizedImages, 'linode/containerlinux')).toBe(
      'Container Linux'
    );
  });
});
