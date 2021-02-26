import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { imageFactory } from 'src/factories/images';

jest.mock('src/hooks/useReduxLoad', () => ({
  useReduxLoad: () => jest.fn().mockReturnValue({ _loading: false }),
}));
jest.mock('src/components/EnhancedSelect/Select');

import { getImagesOptions, groupNameMap, ImageSelect } from './ImageSelect';

const images = imageFactory.buildList(10);

const props = {
  images,
  onSelect: jest.fn(),
};

const privateImage1 = imageFactory.build({
  deprecated: false,
  type: 'manual',
  is_public: false,
});

const recommendedImage1 = imageFactory.build({
  deprecated: false,
  type: 'manual',
  id: 'linode/0001',
  created_by: 'linode',
});

const recommendedImage2 = imageFactory.build({
  deprecated: false,
  type: 'manual',
  id: 'linode/0002',
  created_by: 'linode',
});

const deletedImage1 = imageFactory.build({
  deprecated: false,
  type: 'automatic',
  id: 'private/0001',
  created_by: null,
  expiry: '2019-04-09T04:13:37',
});

describe('ImageSelect', () => {
  describe('getImagesOptions function', () => {
    it('should return a list of GroupType', () => {
      const items = getImagesOptions([recommendedImage1, recommendedImage2]);
      expect(items[0]).toHaveProperty('label', groupNameMap.recommended);
      expect(items[0].options).toHaveLength(2);
    });
    it('should handle multiple groups', () => {
      const items = getImagesOptions([
        recommendedImage1,
        recommendedImage2,
        privateImage1,
        deletedImage1,
      ]);
      expect(items).toHaveLength(3);
      const deleted = items.find(item => item.label === groupNameMap.deleted);
      expect(deleted!.options).toHaveLength(1);
    });
    it('should properly format GroupType options as RS Item type', () => {
      const category = getImagesOptions([recommendedImage1])[0];
      const option = category.options[0];
      expect(option).toHaveProperty('label', recommendedImage1.label);
      expect(option).toHaveProperty('value', recommendedImage1.id);
    });
    it('should handle empty input', () => {
      expect(getImagesOptions([])).toEqual([]);
    });
  });

  describe('ImageSelect component', () => {
    it('should render', () => {
      const { getByText } = renderWithTheme(<ImageSelect {...props} />);
      getByText(/image-0/i);
    });
    it('should display an error', () => {
      const imageError = 'An error';
      const { getByText } = renderWithTheme(
        <ImageSelect {...props} imageError={imageError} />
      );

      getByText(imageError);
    });
  });
});
