import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories/images';
import { getImageGroup } from 'src/utilities/images';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TargetImageSelect } from './TargetImageSelect';

const recommendedImage = imageFactory.build({
  created_by: 'linode',
  deprecated: false,
  id: 'linode/0001',
  type: 'manual',
});

const deletedImage = imageFactory.build({
  created_by: null,
  deprecated: false,
  expiry: '2019-04-09T04:13:37',
  id: 'private/0001',
  type: 'automatic',
});

describe('getImageGroup', () => {
  it('handles the recommended group', () => {
    expect(getImageGroup(recommendedImage)).toBe(
      '64-bit Distributions - Recommended'
    );
  });

  it('handles the deleted image group', () => {
    expect(getImageGroup(deletedImage)).toBe('Recently Deleted Disks');
  });
});

describe('ImageSelect', () => {
  it('should display an error', () => {
    const { getByText } = renderWithTheme(
      <TargetImageSelect
        errorText="An error"
        images={imageFactory.buildList(3)}
        onSelect={vi.fn()}
      />
    );
    expect(getByText('An error')).toBeInTheDocument();
  });

  it('should call onSelect with the selected value', async () => {
    const onSelect = vi.fn();
    const images = [
      imageFactory.build({ label: 'image-0' }),
      imageFactory.build({ label: 'image-1' }),
      imageFactory.build({ label: 'image-2' }),
    ];

    const { getByLabelText, getByText } = renderWithTheme(
      <TargetImageSelect images={images} onSelect={onSelect} />
    );

    await userEvent.click(getByLabelText('Image'));

    await userEvent.click(getByText('image-1'));

    expect(onSelect).toHaveBeenCalledWith(images[1]);
  });

  it('should handle any/all', async () => {
    const onSelect = vi.fn();
    const images = [
      imageFactory.build({ label: 'image-0' }),
      imageFactory.build({ label: 'image-1' }),
      imageFactory.build({ label: 'image-2' }),
    ];

    const { getByLabelText, getByText } = renderWithTheme(
      <TargetImageSelect
        anyAllOption
        images={images}
        isMulti
        onSelect={onSelect}
      />
    );

    await userEvent.click(getByLabelText('Image'));

    await userEvent.click(getByText('Any/All'));

    expect(onSelect).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'any/all' }),
    ]);
  });
});
