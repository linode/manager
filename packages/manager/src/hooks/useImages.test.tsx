import { renderHook } from '@testing-library/react-hooks';
import * as React from 'react';
import { Provider } from 'react-redux';
import { imageFactory } from 'src/factories/images';
import store from 'src/store';
import { apiResponseToMappedState } from 'src/store/store.helpers';
import { filterImages, useImages } from './useImages';

const publicImages = apiResponseToMappedState(
  imageFactory.buildList(10, { is_public: true })
);
const privateImages = apiResponseToMappedState(
  imageFactory.buildList(10, { is_public: false })
);
const allImages = {
  ...publicImages,
  ...privateImages,
};

describe('useHooks', () => {
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

  describe('basic hook usage', () => {
    it('returns the correct data from Redux', () => {
      // This test only works because of the cached Images data we use to
      // initialize the store.
      const wrapper = ({ children }: any) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => useImages(), { wrapper });
      expect(result.current.images.lastUpdated).toBe(0);
    });
  });
});
