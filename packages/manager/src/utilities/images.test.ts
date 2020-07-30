import { imageFactory } from 'src/factories/images';
import { groupImages } from './images';

const [privateImage1, privateImage2] = imageFactory.buildList(2, {
  is_public: false
});

const [deprecatedImage1, deprecatedImage2] = imageFactory.buildList(2, {
  deprecated: true,
  created_by: 'linode'
});

const [recommendedImage1, recommendedImage2] = imageFactory.buildList(2, {
  id: 'linode/image',
  created_by: 'linode'
});

const [deletedImage1, deletedImage2] = imageFactory.buildList(2, {
  deprecated: false,
  type: 'automatic',
  created_by: null,
  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: '2019-05-09T04:13:37'
});

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
