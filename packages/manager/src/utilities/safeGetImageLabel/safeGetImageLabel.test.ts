import { imageFactory, normalizeEntities } from 'src/factories';
import { safeGetImageLabel } from './safeGetImageLabel';

const normalizedImages = normalizeEntities(imageFactory.buildList(10));

describe('safeGetImageLabel', () => {
  it('should return an empty string if no slug provided', () => {
    expect(safeGetImageLabel(normalizedImages, null)).toBe('');
  });

  it('should return "Unknown Image" if the slug does not exist in the image data', () => {
    expect(safeGetImageLabel(normalizedImages, 'duhhhhhhhhhh')).toBe(
      'Unknown Image'
    );
  });

  it('should return the correct image label if it finds a match', () => {
    expect(safeGetImageLabel(normalizedImages, 'private/1')).toBe(
      normalizedImages['private/1'].label
    );
  });
});
