import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageSelectv2 } from './ImageSelectv2';

describe('ImageSelectv2', () => {
  it('should render a default "Images" label', () => {
    const { getByLabelText } = renderWithTheme(<ImageSelectv2 value={null} />);

    expect(getByLabelText('Images')).toBeVisible();
  });

  it('should render default placeholder text', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <ImageSelectv2 value={null} />
    );

    expect(getByPlaceholderText('Choose an image')).toBeVisible();
  });
});
