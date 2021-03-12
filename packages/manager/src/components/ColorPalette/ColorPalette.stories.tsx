import * as React from 'react';
import ColorPalette from './ColorPalette';

export default {
  title: 'Color Palette',
};

export const Default = () => <ColorPalette />;

export const Background = () => <ColorPalette displayBackgrounds />;
