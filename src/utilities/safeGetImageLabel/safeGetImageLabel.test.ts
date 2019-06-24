import { images } from 'src/__data__/images';
import { safeGetImageLabel } from './safeGetImageLabel';

describe('safeGetImageLabel', () => {
  it('should return an empty string if no slug provided', () => {
    expect(safeGetImageLabel(images, null)).toBe('');
  });

  it('should return an empty string if the slug does not exist in the image data', () => {
    expect(safeGetImageLabel(images, 'duhhhhhhhhhh')).toBe('');
  });

  it('should return "Fedora 23"', () => {
    expect(safeGetImageLabel(images, 'linode/Fedora23')).toBe('Fedora 23');
  });
});
