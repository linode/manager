import { shallow } from 'enzyme';
import * as React from 'react';
import {
  deletedImage1,
  images,
  privateImage1,
  recommendedImage1,
  recommendedImage2
} from 'src/__data__/images';
import Select from 'src/components/EnhancedSelect/Select';
import { groupNameMap } from 'src/utilities/images';
import { getImagesOptions, ImageSelect } from './ImageSelect';

const props = {
  classes: { root: '', icon: '', selectContainer: '' },
  images,
  onSelect: jest.fn()
};

const component = shallow(<ImageSelect {...props} />);

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
          <Select onChange={props.onSelect} errorText={'An error'} />
        )
      ).toBeTruthy();
    });
  });
});
