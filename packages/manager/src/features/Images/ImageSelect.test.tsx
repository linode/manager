import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { imageFactory } from 'src/factories/images';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageSelect, getImagesOptions, groupNameMap } from './ImageSelect';

const images = imageFactory.buildList(10);

const props = {
  images,
  onSelect: vi.fn(),
};

const privateImage1 = imageFactory.build({
  deprecated: false,
  is_public: false,
  type: 'manual',
});

const recommendedImage1 = imageFactory.build({
  created_by: 'linode',
  deprecated: false,
  id: 'linode/0001',
  type: 'manual',
});

const recommendedImage2 = imageFactory.build({
  created_by: 'linode',
  deprecated: false,
  id: 'linode/0002',
  type: 'manual',
});

const deletedImage1 = imageFactory.build({
  created_by: null,
  deprecated: false,
  expiry: '2019-04-09T04:13:37',
  id: 'private/0001',
  type: 'automatic',
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
      const deleted = items.find((item) => item.label === groupNameMap.deleted);
      expect(deleted!.options).toHaveLength(1);
    });

    it('should properly format GroupType options', () => {
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
      renderWithTheme(<ImageSelect {...props} />);
      screen.getByRole('combobox');
    });

    it('should display an error', () => {
      const imageError = 'An error';
      renderWithTheme(<ImageSelect {...props} imageError={imageError} />);
      expect(screen.getByText(imageError)).toBeInTheDocument();
    });

    it('should call onSelect with the selected value', () => {
      const onSelectMock = vi.fn();
      renderWithTheme(
        <ImageSelect {...props} images={images} onSelect={onSelectMock} />
      );

      const inputElement = screen.getByRole('combobox');

      fireEvent.change(inputElement, { target: { value: 'image-1' } });
      fireEvent.keyDown(inputElement, { key: 'ArrowDown' });
      fireEvent.keyDown(inputElement, { key: 'Enter' });

      expect(onSelectMock).toHaveBeenCalledWith({
        label: 'image-1',
        value: 'private/1',
      });
    });

    it('should handle multiple selections', () => {
      const onSelectMock = vi.fn();
      renderWithTheme(
        <ImageSelect {...props} isMulti onSelect={onSelectMock} />
      );

      const inputElement = screen.getByRole('combobox');

      // Select first option
      fireEvent.change(inputElement, { target: { value: 'image-1' } });
      fireEvent.keyDown(inputElement, { key: 'ArrowDown' });
      fireEvent.keyDown(inputElement, { key: 'Enter' });

      // Select second option
      fireEvent.change(inputElement, { target: { value: 'image-2' } });
      fireEvent.keyDown(inputElement, { key: 'ArrowDown' });
      fireEvent.keyDown(inputElement, { key: 'Enter' });

      expect(onSelectMock).toHaveBeenCalledWith([
        { label: 'image-1', value: 'private/1' },
        { label: 'image-2', value: 'private/2' },
      ]);
    });
  });
});
