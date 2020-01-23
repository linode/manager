import { shallow } from 'enzyme';
import * as React from 'react';

import { images } from 'src/__data__/images';
import Select from 'src/components/EnhancedSelect/Select';

import {
  getImagesOptions,
  groupImages,
  groupNameMap,
  ImageSelect
} from './ImageSelect';

const props = {
  classes: { root: '', icon: '', selectContainer: '' },
  images,
  onSelect: jest.fn()
};

const component = shallow(<ImageSelect {...props} />);

const privateImage1 = {
  deprecated: false,
  type: 'manual',
  id: 'private/0001',
  created_by: 'somefella',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: null
};

const privateImage2 = {
  deprecated: false,
  type: 'manual',
  id: 'private/0002',
  created_by: 'somefella',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: null
};

const deprecatedImage1 = {
  deprecated: true,
  type: 'manual',
  id: 'linode/0001',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: null
};

const deprecatedImage2 = {
  deprecated: true,
  type: 'manual',
  id: 'linode/0002',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: null
};

const recommendedImage1 = {
  deprecated: false,
  type: 'manual',
  id: 'linode/0001',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: null
};

const recommendedImage2 = {
  deprecated: false,
  type: 'manual',
  id: 'linode/0002',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: null
};

const deletedImage1 = {
  deprecated: false,
  type: 'automatic',
  id: 'private/0001',
  created_by: null,

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: '2019-04-09T04:13:37'
};

const deletedImage2 = {
  deprecated: false,
  type: 'automatic',
  id: 'private/0002',
  created_by: null,

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
  expiry: '2019-05-09T04:13:37'
};

describe('ImageSelect', () => {
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
        deletedImage1
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
      expect(component).toBeDefined();
    });
    it('should display an error', () => {
      component.setProps({ imageError: 'An error' });
      expect(
        component.containsMatchingElement(
          <Select
            onChange={props.onSelect}
            errorText={'An error'}
            label="Image"
          />
        )
      ).toBeTruthy();
    });
  });
});
