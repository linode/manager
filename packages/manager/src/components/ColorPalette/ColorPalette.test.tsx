import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ColorPalette } from './ColorPalette';

describe('Color Palette', () => {
  it('renders the Color Palette', () => {
    const { container, getByText } = renderWithTheme(<ColorPalette />);

    getByText('Primary Colors');
    getByText('Etc.');
    getByText('Background Colors');
    getByText('Typography Colors');
    getByText('Border Colors');

    // there are 55 individual colors in our Color Palette currently
    const colors = container.querySelectorAll('[class="css-n6e2zj-swatch"]');
    expect(colors.length).toBe(55);
  });
});
