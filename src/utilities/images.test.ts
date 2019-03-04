import {
  deletedImage1,
  deletedImage2,
  deprecatedImage1,
  deprecatedImage2,
  privateImage1,
  privateImage2,
  recommendedImage1,
  recommendedImage2
} from 'src/__data__/images';
import { groupImages } from './images';

describe('groupImages method', () => {
  it("should return a group of the user's private images", () => {
    const result = groupImages([privateImage1, privateImage2]);

    const expected = {
      images: [privateImage1, privateImage2]
    };

    expect(result).toEqual(expected);
  });

  it('should return group deprecated images', () => {
    const result = groupImages([deprecatedImage1, deprecatedImage2]);

    const expected = {
      older: [deprecatedImage1, deprecatedImage2]
    };

    expect(result).toEqual(expected);
  });

  it('should return group recommended images', () => {
    const _images = [recommendedImage1, recommendedImage2];
    const result = groupImages(_images);

    const expected = {
      recommended: _images
    };

    expect(result).toEqual(expected);
  });

  it('should return group deleted images', () => {
    const result = groupImages([deletedImage1, deletedImage2]);

    const expected = {
      deleted: [deletedImage1, deletedImage2]
    };

    expect(result).toEqual(expected);
  });
});
