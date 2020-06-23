import { imageFactory } from 'src/factories/images';
import { apiResponseToMappedState } from 'src/store/store.helpers';
import { filterImages } from './useImages';

const publicImages = apiResponseToMappedState(
  imageFactory.buildList(10, { is_public: true })
);
const privateImages = apiResponseToMappedState(
  imageFactory.buildList(10, { is_public: false })
);
const allImages = {
  ...publicImages,
  ...privateImages
};

describe('Filtering images', () => {
  it('should return public images only when public is specified', () => {
    expect(filterImages('public', allImages)).toEqual(publicImages);
  });

  it('should return private images only when private is specified', () => {
    expect(filterImages('private', allImages)).toEqual(privateImages);
  });

  it('should return all images when all is specified', () => {
    expect(filterImages('all', allImages)).toEqual(allImages);
  });
});
